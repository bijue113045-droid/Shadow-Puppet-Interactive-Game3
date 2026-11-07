import React, { useRef, useState, useCallback } from 'react';
import { PuppetId, PuppetPose, JointName, JOINT_CONSTRAINTS } from '../types/puppet';
import { puppetAudio } from '../utils/audio';

interface PuppetRendererProps {
  puppetId: PuppetId;
  pose: PuppetPose;
  onPoseChange?: (newPose: PuppetPose, activeJoint?: JointName) => void;
  interactive?: boolean;
  showRods?: boolean;
  showJointHelpers?: boolean;
  isShadowOnly?: boolean;
  ghostPose?: PuppetPose | null;
  activeJointHighlight?: JointName | null;
  className?: string;
  width?: number;
  height?: number;
}

export const PuppetRenderer: React.FC<PuppetRendererProps> = ({
  puppetId,
  pose,
  onPoseChange,
  interactive = true,
  showRods = true,
  showJointHelpers = true,
  isShadowOnly = false,
  ghostPose = null,
  activeJointHighlight = null,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedJoint, setSelectedJoint] = useState<JointName | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    joint: JointName;
    startAngle: number;
    startMouseAngle: number;
    pivotX: number;
    pivotY: number;
  } | null>(null);

  const lastSoundTimeRef = useRef<number>(0);

  // SVG coordinate transformation
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const inverse = ctm.inverse();
      const transformed = pt.matrixTransform(inverse);
      return { x: transformed.x, y: transformed.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 740,
      y: ((clientY - rect.top) / rect.height) * 980,
    };
  }, []);

  const isWarrior = puppetId === 'warrior';

  // EXACT PIVOT COORDINATES FROM USER'S ARTWORK (730x980)
  // Warrior Pivots
  const W_PIVOTS = {
    root: { x: 407, y: 430 },
    neck: { x: 372, y: 195 },
    rShoulder: { x: 126, y: 290 },
    rElbow: { x: 92, y: 400 },
    rWrist: { x: 53, y: 465 },
    lShoulder: { x: 500, y: 320 },
    lElbow: { x: 586, y: 442 },
    lWrist: { x: 695, y: 510 },
    rHip: { x: 260, y: 680 },
    rKnee: { x: 170, y: 856 },
    rFoot: { x: 130, y: 940 },
    lHip: { x: 480, y: 620 },
    lKnee: { x: 520, y: 665 },
    lFoot: { x: 610, y: 915 },
  };

  // Scholar Pivots (720x980)
  const S_PIVOTS = {
    root: { x: 355, y: 420 },
    neck: { x: 365, y: 215 },
    rShoulder: { x: 270, y: 330 },
    rElbow: { x: 180, y: 270 },
    rWrist: { x: 140, y: 240 },
    lShoulder: { x: 430, y: 275 },
    lElbow: { x: 490, y: 390 },
    lWrist: { x: 645, y: 490 },
    rHip: { x: 310, y: 640 },
    rKnee: { x: 280, y: 780 },
    rFoot: { x: 230, y: 920 },
    lHip: { x: 400, y: 640 },
    lKnee: { x: 420, y: 780 },
    lFoot: { x: 480, y: 925 },
  };

  const p = isWarrior ? W_PIVOTS : S_PIVOTS;

  // Pointer drag start
  const handlePointerDown = (joint: JointName, e: React.PointerEvent) => {
    if (!interactive || !onPoseChange) return;
    e.stopPropagation();
    e.preventDefault();

    const target = e.currentTarget as Element;
    target.setPointerCapture(e.pointerId);

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    let pivot = p.root;
    let initialAngle = 0;

    switch (joint) {
      case 'head':
        pivot = p.neck;
        initialAngle = pose.headAngle;
        break;
      case 'torso':
        pivot = p.root;
        initialAngle = pose.torsoAngle;
        break;
      case 'rightUpperArm':
        pivot = p.rShoulder;
        initialAngle = pose.rightUpperArm;
        break;
      case 'rightForearm':
        pivot = p.rElbow;
        initialAngle = pose.rightForearm;
        break;
      case 'leftUpperArm':
        pivot = p.lShoulder;
        initialAngle = pose.leftUpperArm;
        break;
      case 'leftForearm':
        pivot = p.lElbow;
        initialAngle = pose.leftForearm;
        break;
      case 'rightThigh':
        pivot = p.rHip;
        initialAngle = pose.rightThigh;
        break;
      case 'rightShin':
        pivot = p.rKnee;
        initialAngle = pose.rightShin;
        break;
      case 'leftThigh':
        pivot = p.lHip;
        initialAngle = pose.leftThigh;
        break;
      case 'leftShin':
        pivot = p.lKnee;
        initialAngle = pose.leftShin;
        break;
      case 'root':
        pivot = { x: coords.x - pose.posX, y: coords.y - pose.posY };
        initialAngle = 0;
        break;
    }

    const mouseAngle = Math.atan2(coords.y - pivot.y, coords.x - pivot.x) * (180 / Math.PI);

    dragStartRef.current = {
      joint,
      startAngle: initialAngle,
      startMouseAngle: mouseAngle,
      pivotX: pivot.x,
      pivotY: pivot.y,
    };

    setSelectedJoint(joint);
    setIsDragging(true);
    puppetAudio.playJointClick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !onPoseChange) return;
    e.preventDefault();

    const { joint, startAngle, startMouseAngle, pivotX, pivotY } = dragStartRef.current;
    const coords = getSvgCoordinates(e.clientX, e.clientY);

    const newPose = { ...pose };

    if (joint === 'root') {
      const newPosX = Math.max(-180, Math.min(180, coords.x - pivotX));
      const newPosY = Math.max(-100, Math.min(100, coords.y - pivotY));
      newPose.posX = Math.round(newPosX);
      newPose.posY = Math.round(newPosY);
    } else {
      const currentMouseAngle = Math.atan2(coords.y - pivotY, coords.x - pivotX) * (180 / Math.PI);
      let deltaAngle = currentMouseAngle - startMouseAngle;

      while (deltaAngle > 180) deltaAngle -= 360;
      while (deltaAngle < -180) deltaAngle += 360;

      let targetAngle = startAngle + deltaAngle;
      const constraint = JOINT_CONSTRAINTS[joint];
      targetAngle = Math.max(constraint.min, Math.min(constraint.max, targetAngle));
      targetAngle = Math.round(targetAngle);

      switch (joint) {
        case 'head':
          newPose.headAngle = targetAngle;
          break;
        case 'torso':
          newPose.torsoAngle = targetAngle;
          break;
        case 'rightUpperArm':
          newPose.rightUpperArm = targetAngle;
          break;
        case 'rightForearm':
          newPose.rightForearm = targetAngle;
          break;
        case 'leftUpperArm':
          newPose.leftUpperArm = targetAngle;
          break;
        case 'leftForearm':
          newPose.leftForearm = targetAngle;
          break;
        case 'rightThigh':
          newPose.rightThigh = targetAngle;
          break;
        case 'rightShin':
          newPose.rightShin = targetAngle;
          break;
        case 'leftThigh':
          newPose.leftThigh = targetAngle;
          break;
        case 'leftShin':
          newPose.leftShin = targetAngle;
          break;
      }
    }

    const now = performance.now();
    if (now - lastSoundTimeRef.current > 180) {
      puppetAudio.playJointClick();
      lastSoundTimeRef.current = now;
    }

    onPoseChange(newPose, joint);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      const target = e.currentTarget as Element;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  // Puppet Image source paths
  const warriorSrc = '/assets/puppets/warrior_cleaned.png';
  const scholarSrc = '/assets/puppets/scholar_cleaned.png';
  const currentSrc = isWarrior ? warriorSrc : scholarSrc;

  // Render the authentic articulated character from user image
  const renderAuthenticPuppet = (currentPose: PuppetPose, isGhost = false) => {
    const opacity = isGhost ? 0.35 : 1;
    const filter = isGhost ? undefined : isShadowOnly ? 'url(#shadowSilhouette)' : 'url(#leatherShadow)';

    if (isWarrior) {
      return (
        <g
          opacity={opacity}
          filter={filter}
          transform={`translate(${currentPose.posX}, ${currentPose.posY})`}
        >
          {/* ROOT WRAPPER */}
          {/* 1. TORSO (Rotates around center belt buckle W_PIVOTS.root) */}
          <g
            transform={`translate(${W_PIVOTS.root.x}, ${W_PIVOTS.root.y}) rotate(${currentPose.torsoAngle}) translate(-${W_PIVOTS.root.x}, -${W_PIVOTS.root.y})`}
          >
            {/* 1.1 BACKGROUND LEGS */}
            {/* Right Thigh (Viewer Left) */}
            <g
              transform={`translate(${W_PIVOTS.rHip.x}, ${W_PIVOTS.rHip.y}) rotate(${currentPose.rightThigh}) translate(-${W_PIVOTS.rHip.x}, -${W_PIVOTS.rHip.y})`}
            >
              <image
                href={warriorSrc}
                width="730"
                height="980"
                clipPath="url(#w_r_thigh_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('rightThigh', e)}
              />

              {/* Right Shin & Boot */}
              <g
                transform={`translate(${W_PIVOTS.rKnee.x}, ${W_PIVOTS.rKnee.y}) rotate(${currentPose.rightShin}) translate(-${W_PIVOTS.rKnee.x}, -${W_PIVOTS.rKnee.y})`}
              >
                <image
                  href={warriorSrc}
                  width="730"
                  height="980"
                  clipPath="url(#w_r_shin_clip)"
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown('rightShin', e)}
                />
              </g>
            </g>

            {/* Left Leg & Boot (Viewer Right) */}
            <g
              transform={`translate(${W_PIVOTS.lKnee.x}, ${W_PIVOTS.lKnee.y}) rotate(${currentPose.leftShin}) translate(-${W_PIVOTS.lKnee.x}, -${W_PIVOTS.lKnee.y})`}
            >
              <image
                href={warriorSrc}
                width="730"
                height="980"
                clipPath="url(#w_l_leg_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('leftShin', e)}
              />
            </g>

            {/* 1.2 MAIN BODY & SKIRT */}
            <image
              href={warriorSrc}
              width="730"
              height="980"
              clipPath="url(#w_torso_clip)"
              className="cursor-pointer"
              onPointerDown={(e) => handlePointerDown('torso', e)}
            />

            {/* 1.3 HEAD (Rotates around neck W_PIVOTS.neck) */}
            <g
              transform={`translate(${W_PIVOTS.neck.x}, ${W_PIVOTS.neck.y}) rotate(${currentPose.headAngle}) translate(-${W_PIVOTS.neck.x}, -${W_PIVOTS.neck.y})`}
            >
              <image
                href={warriorSrc}
                width="730"
                height="980"
                clipPath="url(#w_head_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('head', e)}
              />
            </g>

            {/* 1.4 RIGHT ARM (Viewer Left Arm) */}
            <g
              transform={`translate(${W_PIVOTS.rShoulder.x}, ${W_PIVOTS.rShoulder.y}) rotate(${currentPose.rightUpperArm}) translate(-${W_PIVOTS.rShoulder.x}, -${W_PIVOTS.rShoulder.y})`}
            >
              <image
                href={warriorSrc}
                width="730"
                height="980"
                clipPath="url(#w_r_upper_arm_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('rightUpperArm', e)}
              />

              {/* Right Forearm & Hand */}
              <g
                transform={`translate(${W_PIVOTS.rElbow.x}, ${W_PIVOTS.rElbow.y}) rotate(${currentPose.rightForearm}) translate(-${W_PIVOTS.rElbow.x}, -${W_PIVOTS.rElbow.y})`}
              >
                <image
                  href={warriorSrc}
                  width="730"
                  height="980"
                  clipPath="url(#w_r_forearm_clip)"
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown('rightForearm', e)}
                />
              </g>
            </g>

            {/* 1.5 LEFT ARM (Viewer Right Arm) */}
            <g
              transform={`translate(${W_PIVOTS.lShoulder.x}, ${W_PIVOTS.lShoulder.y}) rotate(${currentPose.leftUpperArm}) translate(-${W_PIVOTS.lShoulder.x}, -${W_PIVOTS.lShoulder.y})`}
            >
              <image
                href={warriorSrc}
                width="730"
                height="980"
                clipPath="url(#w_l_upper_arm_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('leftUpperArm', e)}
              />

              {/* Left Forearm & Hand */}
              <g
                transform={`translate(${W_PIVOTS.lElbow.x}, ${W_PIVOTS.lElbow.y}) rotate(${currentPose.leftForearm}) translate(-${W_PIVOTS.lElbow.x}, -${W_PIVOTS.lElbow.y})`}
              >
                <image
                  href={warriorSrc}
                  width="730"
                  height="980"
                  clipPath="url(#w_l_forearm_clip)"
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown('leftForearm', e)}
                />
              </g>
            </g>
          </g>
        </g>
      );
    }

    // SCHOLAR
    return (
      <g
        opacity={opacity}
        filter={filter}
        transform={`translate(${currentPose.posX}, ${currentPose.posY})`}
      >
        {/* ROOT WRAPPER */}
        <g
          transform={`translate(${S_PIVOTS.root.x}, ${S_PIVOTS.root.y}) rotate(${currentPose.torsoAngle}) translate(-${S_PIVOTS.root.x}, -${S_PIVOTS.root.y})`}
        >
          {/* Main Gown Body & Pleats */}
          <image
            href={scholarSrc}
            width="720"
            height="980"
            clipPath="url(#s_torso_clip)"
            className="cursor-pointer"
            onPointerDown={(e) => handlePointerDown('torso', e)}
          />

          {/* Shoes */}
          <image
            href={scholarSrc}
            width="720"
            height="980"
            clipPath="url(#s_shoes_clip)"
          />

          {/* Head & Crown */}
          <g
            transform={`translate(${S_PIVOTS.neck.x}, ${S_PIVOTS.neck.y}) rotate(${currentPose.headAngle}) translate(-${S_PIVOTS.neck.x}, -${S_PIVOTS.neck.y})`}
          >
            <image
              href={scholarSrc}
              width="720"
              height="980"
              clipPath="url(#s_head_clip)"
              className="cursor-pointer"
              onPointerDown={(e) => handlePointerDown('head', e)}
            />
          </g>

          {/* Right Arm & Fan (Viewer Left) */}
          <g
            transform={`translate(${S_PIVOTS.rShoulder.x}, ${S_PIVOTS.rShoulder.y}) rotate(${currentPose.rightUpperArm}) translate(-${S_PIVOTS.rShoulder.x}, -${S_PIVOTS.rShoulder.y})`}
          >
            <image
              href={scholarSrc}
              width="720"
              height="980"
              clipPath="url(#s_r_arm_upper_clip)"
              className="cursor-pointer"
              onPointerDown={(e) => handlePointerDown('rightUpperArm', e)}
            />

            {/* Forearm, Fan & Drapery */}
            <g
              transform={`translate(${S_PIVOTS.rElbow.x}, ${S_PIVOTS.rElbow.y}) rotate(${currentPose.rightForearm}) translate(-${S_PIVOTS.rElbow.x}, -${S_PIVOTS.rElbow.y})`}
            >
              <image
                href={scholarSrc}
                width="720"
                height="980"
                clipPath="url(#s_r_arm_lower_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('rightForearm', e)}
              />
            </g>
          </g>

          {/* Left Arm & Flowing Embroidered Sleeve (Viewer Right) */}
          <g
            transform={`translate(${S_PIVOTS.lShoulder.x}, ${S_PIVOTS.lShoulder.y}) rotate(${currentPose.leftUpperArm}) translate(-${S_PIVOTS.lShoulder.x}, -${S_PIVOTS.lShoulder.y})`}
          >
            <image
              href={scholarSrc}
              width="720"
              height="980"
              clipPath="url(#s_l_arm_upper_clip)"
              className="cursor-pointer"
              onPointerDown={(e) => handlePointerDown('leftUpperArm', e)}
            />

            {/* Forearm & Huge Sleeve */}
            <g
              transform={`translate(${S_PIVOTS.lElbow.x}, ${S_PIVOTS.lElbow.y}) rotate(${currentPose.leftForearm}) translate(-${S_PIVOTS.lElbow.x}, -${S_PIVOTS.lElbow.y})`}
            >
              <image
                href={scholarSrc}
                width="720"
                height="980"
                clipPath="url(#s_l_arm_lower_clip)"
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown('leftForearm', e)}
              />
            </g>
          </g>
        </g>
      </g>
    );
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 740 980"
        className="w-full h-full max-h-[720px] overflow-visible touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          {/* Shadow Filter for Translucent Leather Depth */}
          <filter id="leatherShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="8" stdDeviation="5" floodColor="#1a0f05" floodOpacity="0.55" />
          </filter>

          {/* Ancient Backlit Silhouette Filter */}
          <filter id="shadowSilhouette">
            <feColorMatrix
              type="matrix"
              values="0.2 0 0 0 0.1
                      0 0.15 0 0 0.05
                      0 0 0.1 0 0.02
                      0 0 0 1 0"
            />
          </filter>

          {/* ================= WARRIOR CLIPS ================= */}
          {/* Head: Helmet, Plume, Face, Beard */}
          <clipPath id="w_head_clip">
            <polygon points="230,0 450,0 525,100 525,200 500,385 410,385 365,250 330,195 280,180 230,70" />
          </clipPath>

          {/* Torso & Battle Skirt */}
          <clipPath id="w_torso_clip">
            <polygon points="210,180 540,180 640,400 640,740 460,780 100,730 100,480 230,390" />
          </clipPath>

          {/* Right Upper Arm (Viewer Left) */}
          <clipPath id="w_r_upper_arm_clip">
            <polygon points="75,230 250,230 250,340 160,370 85,380 65,310" />
          </clipPath>

          {/* Right Forearm & Hand (Viewer Left) */}
          <clipPath id="w_r_forearm_clip">
            <polygon points="15,350 145,350 130,440 90,520 15,500" />
          </clipPath>

          {/* Left Upper Arm (Viewer Right) */}
          <clipPath id="w_l_upper_arm_clip">
            <polygon points="480,260 630,330 640,430 550,440 480,350" />
          </clipPath>

          {/* Left Forearm & Hand (Viewer Right) */}
          <clipPath id="w_l_forearm_clip">
            <polygon points="530,390 650,390 735,510 735,580 640,580 540,470" />
          </clipPath>

          {/* Right Thigh (Viewer Left) */}
          <clipPath id="w_r_thigh_clip">
            <polygon points="210,630 330,630 300,770 240,840 180,820 170,720" />
          </clipPath>

          {/* Right Shin & Boot (Viewer Left) */}
          <clipPath id="w_r_shin_clip">
            <polygon points="140,790 260,790 240,960 110,960 110,870" />
          </clipPath>

          {/* Left Leg & Boot (Viewer Right) */}
          <clipPath id="w_l_leg_clip">
            <polygon points="470,630 610,630 660,930 510,930 470,750" />
          </clipPath>

          {/* ================= SCHOLAR CLIPS ================= */}
          {/* Head & Cap */}
          <clipPath id="s_head_clip">
            <polygon points="270,10 480,10 490,210 380,250 280,210 270,110" />
          </clipPath>

          {/* Torso & Gown Pleats */}
          <clipPath id="s_torso_clip">
            <polygon points="260,200 460,200 480,420 630,890 140,890 280,450" />
          </clipPath>

          {/* Shoes */}
          <clipPath id="s_shoes_clip">
            <polygon points="140,860 630,860 630,960 140,960" />
          </clipPath>

          {/* Right Upper Arm (Viewer Left) */}
          <clipPath id="s_r_arm_upper_clip">
            <polygon points="230,270 330,270 340,380 240,410 170,360" />
          </clipPath>

          {/* Right Forearm + Fan (Viewer Left) */}
          <clipPath id="s_r_arm_lower_clip">
            <polygon points="40,90 260,90 320,290 270,410 130,420 90,280" />
          </clipPath>

          {/* Left Upper Arm (Viewer Right) */}
          <clipPath id="s_l_arm_upper_clip">
            <polygon points="410,240 540,240 570,390 470,410 420,340" />
          </clipPath>

          {/* Left Forearm & Flowing Sleeve (Viewer Right) */}
          <clipPath id="s_l_arm_lower_clip">
            <polygon points="470,350 630,350 715,480 700,640 550,630 470,410" />
          </clipPath>
        </defs>

        {/* GHOST POSE (if active for challenge alignment) */}
        {ghostPose && renderAuthenticPuppet(ghostPose, true)}

        {/* MAIN ARTICULATED PUPPET FROM USER IMAGE */}
        {renderAuthenticPuppet(pose, false)}

        {/* BAMBOO CONTROL RODS (操偶竹籤 / 操縱桿) */}
        {showRods && (
          <g opacity={0.65} strokeLinecap="round" pointerEvents="none">
            {/* Neck rod (領籤) */}
            <line
              x1={p.neck.x + pose.posX}
              y1={p.neck.y + pose.posY}
              x2={p.neck.x + pose.posX - 25}
              y2={970}
              stroke="#5c3a1a"
              strokeWidth={4}
            />
            <circle
              cx={p.neck.x + pose.posX}
              cy={p.neck.y + pose.posY}
              r="6"
              fill="#d4af37"
              stroke="#2e1708"
              strokeWidth={1.5}
            />

            {/* Right hand rod (右手籤 / Viewer Left Hand) */}
            <line
              x1={p.rWrist.x + pose.posX}
              y1={p.rWrist.y + pose.posY}
              x2={p.rWrist.x + pose.posX - 35}
              y2={970}
              stroke="#5c3a1a"
              strokeWidth={3.5}
            />
            <circle
              cx={p.rWrist.x + pose.posX}
              cy={p.rWrist.y + pose.posY}
              r="5"
              fill="#d4af37"
              stroke="#2e1708"
              strokeWidth={1.5}
            />

            {/* Left hand rod (左手籤 / Viewer Right Hand) */}
            <line
              x1={p.lWrist.x + pose.posX}
              y1={p.lWrist.y + pose.posY}
              x2={p.lWrist.x + pose.posX + 35}
              y2={970}
              stroke="#5c3a1a"
              strokeWidth={3.5}
            />
            <circle
              cx={p.lWrist.x + pose.posX}
              cy={p.lWrist.y + pose.posY}
              r="5"
              fill="#d4af37"
              stroke="#2e1708"
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* INTERACTIVE JOINT HIGHLIGHT HANDLES (Matches Painted Rivet Holes) */}
        {interactive && showJointHelpers && (
          <g>
            {[
              { id: 'head', name: '頭部', x: p.neck.x + pose.posX, y: p.neck.y + pose.posY - 30 },
              { id: 'torso', name: '軀幹', x: p.root.x + pose.posX, y: p.root.y + pose.posY },
              { id: 'rightUpperArm', name: '右肩', x: p.rShoulder.x + pose.posX, y: p.rShoulder.y + pose.posY },
              { id: 'rightForearm', name: '右肘', x: p.rElbow.x + pose.posX, y: p.rElbow.y + pose.posY },
              { id: 'leftUpperArm', name: '左肩', x: p.lShoulder.x + pose.posX, y: p.lShoulder.y + pose.posY },
              { id: 'leftForearm', name: '左肘', x: p.lElbow.x + pose.posX, y: p.lElbow.y + pose.posY },
              { id: 'rightThigh', name: '右胯', x: p.rHip.x + pose.posX, y: p.rHip.y + pose.posY },
              { id: 'rightShin', name: '右膝', x: p.rKnee.x + pose.posX, y: p.rKnee.y + pose.posY },
              { id: 'leftThigh', name: '左胯', x: p.lHip.x + pose.posX, y: p.lHip.y + pose.posY },
              { id: 'leftShin', name: '左膝', x: p.lKnee.x + pose.posX, y: p.lKnee.y + pose.posY },
              { id: 'root', name: '整體位移', x: p.root.x + pose.posX, y: p.root.y + pose.posY + 30 },
            ].map((j) => {
              const isSelected = selectedJoint === j.id;
              const isTargetHighlight = activeJointHighlight === j.id;
              const haloColor = isTargetHighlight ? '#10b981' : isSelected ? '#f59e0b' : '#d4af37';

              return (
                <g
                  key={j.id}
                  transform={`translate(${j.x}, ${j.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onPointerDown={(e) => handlePointerDown(j.id as JointName, e)}
                >
                  {/* Outer pulse ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected || isTargetHighlight ? 16 : 10}
                    fill={haloColor}
                    fillOpacity={isSelected || isTargetHighlight ? 0.4 : 0.18}
                    stroke={haloColor}
                    strokeWidth={isSelected || isTargetHighlight ? 2.5 : 1.2}
                    strokeDasharray={isSelected ? '3,3' : undefined}
                  />
                  {/* Inner pivot rivet dot */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected || isTargetHighlight ? 6 : 4.5}
                    fill={haloColor}
                    stroke="#ffffff"
                    strokeWidth={1.8}
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};
