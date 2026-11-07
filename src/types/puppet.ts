export type PuppetId = 'warrior' | 'scholar';

export interface PuppetPose {
  headAngle: number;       // Neck pivot (-35 to 35)
  torsoAngle: number;      // Spine/waist tilt (-25 to 25)
  leftUpperArm: number;    // Shoulder (-140 to 140)
  leftForearm: number;     // Elbow (-130 to 30)
  rightUpperArm: number;   // Shoulder (-140 to 140)
  rightForearm: number;    // Elbow (-130 to 30)
  leftThigh: number;       // Hip (-60 to 60)
  leftShin: number;        // Knee (-80 to 20)
  rightThigh: number;      // Hip (-60 to 60)
  rightShin: number;       // Knee (-80 to 20)
  posX: number;            // Horizontal offset (-200 to 200)
  posY: number;            // Vertical offset (-100 to 100)
}

export type JointName = 
  | 'head'
  | 'torso'
  | 'leftUpperArm'
  | 'leftForearm'
  | 'rightUpperArm'
  | 'rightForearm'
  | 'leftThigh'
  | 'leftShin'
  | 'rightThigh'
  | 'rightShin'
  | 'root';

export interface JointConstraint {
  min: number;
  max: number;
  label: string;
  enLabel: string;
}

export const JOINT_CONSTRAINTS: Record<JointName, JointConstraint> = {
  head: { min: -35, max: 35, label: '頭部', enLabel: 'Head' },
  torso: { min: -25, max: 25, label: '軀幹', enLabel: 'Torso' },
  leftUpperArm: { min: -140, max: 140, label: '左大臂', enLabel: 'Left Upper Arm' },
  leftForearm: { min: -130, max: 35, label: '左小臂', enLabel: 'Left Forearm' },
  rightUpperArm: { min: -140, max: 140, label: '右大臂', enLabel: 'Right Upper Arm' },
  rightForearm: { min: -130, max: 35, label: '右小臂', enLabel: 'Right Forearm' },
  leftThigh: { min: -60, max: 60, label: '左大腿', enLabel: 'Left Thigh' },
  leftShin: { min: -80, max: 20, label: '左小腿', enLabel: 'Left Shin' },
  rightThigh: { min: -60, max: 60, label: '右大腿', enLabel: 'Right Thigh' },
  rightShin: { min: -80, max: 20, label: '右小腿', enLabel: 'Right Shin' },
  root: { min: -200, max: 200, label: '全身位移', enLabel: 'Root Position' },
};

export const DEFAULT_WARRIOR_POSE: PuppetPose = {
  headAngle: 0,
  torsoAngle: 0,
  leftUpperArm: 0,
  leftForearm: 0,
  rightUpperArm: 0,
  rightForearm: 0,
  leftThigh: 0,
  leftShin: 0,
  rightThigh: 0,
  rightShin: 0,
  posX: 0,
  posY: 0,
};

export const DEFAULT_SCHOLAR_POSE: PuppetPose = {
  headAngle: 0,
  torsoAngle: 0,
  leftUpperArm: 0,
  leftForearm: 0,
  rightUpperArm: 0,
  rightForearm: 0,
  leftThigh: 0,
  leftShin: 0,
  rightThigh: 0,
  rightShin: 0,
  posX: 0,
  posY: 0,
};

export interface RecordedFrame {
  time: number; // millisecond timestamp relative to recording start
  pose: PuppetPose;
}

export interface PerformanceRecording {
  id: string;
  name: string;
  character: PuppetId;
  duration: number; // in seconds
  createdAt: string;
  frames: RecordedFrame[];
}

export interface ChallengeLevel {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targetPose: PuppetPose;
  targetKeyJoints: Array<keyof PuppetPose>;
  conditionText: string;
  type: 'wave' | 'bow' | 'walk';
  timeLimit: number; // in seconds
}
