const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve('public/assets/puppets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to run convert
function run(cmd) {
  console.log('Running:', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

console.log('--- Step 1: Preprocessing Clean Base Images ---');
// Warrior base: 730x980 from 30,20
// Remove the top-left cloud (0,0 to 200,200) and the "武將" plaque (580,0 to 730,280)
run(`convert "public/assets/aistudio/___________________44f1b981.png" -crop 730x980+30+20 +repage -fuzz 9% -transparent "srgb(251,239,218)" "${outDir}/warrior_base.png"`);

// Scholar base: 720x980 from 770,20
// Remove the "文生" plaque (570,0 to 720,280)
run(`convert "public/assets/aistudio/___________________44f1b981.png" -crop 720x980+770+20 +repage -fuzz 9% -transparent "srgb(251,239,218)" "${outDir}/scholar_base.png"`);

console.log('--- Step 2: Clean artifacts (plaques and background clouds) ---');
// Clean warrior clouds & plaque
run(`convert "${outDir}/warrior_base.png" \\
  \\( +clone -fill black -colorize 100 -fill white -draw "rectangle 0,0 200,200" -draw "rectangle 580,0 730,280" \\) \\
  -alpha off -compose DstOut -composite "${outDir}/warrior_cleaned.png"`);

// Clean scholar plaque & side artifacts
run(`convert "${outDir}/scholar_base.png" \\
  \\( +clone -fill black -colorize 100 -fill white -draw "rectangle 570,0 720,280" -draw "rectangle 0,500 40,650" \\) \\
  -alpha off -compose DstOut -composite "${outDir}/scholar_cleaned.png"`);

console.log('--- Step 3: Extract Warrior Segments ---');
// Helper to mask and trim
function extractPart(source, polygonPoints, outputFile) {
  const maskCmd = `convert "${source}" \\
    \\( -size 730x980 xc:black -fill white -draw "polygon ${polygonPoints}" \\) \\
    -alpha off -compose CopyOpacity -composite "${outputFile}"`;
  run(maskCmd);
}

// 1. Warrior Head: helmet, red plume, face, beard
// Bounds: plume starts ~230,0 down to beard tip at 480,385
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '230,0 450,0 520,110 520,200 495,385 410,385 365,250 330,190 280,180 230,80',
  `${outDir}/warrior_head.png`
);

// 2. Warrior Right Upper Arm (Viewer Left): from shoulder 126,290 to elbow 92,400
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '90,240 260,240 250,330 140,360 85,380 75,320',
  `${outDir}/warrior_right_upper_arm.png`
);

// 3. Warrior Right Forearm & Hand (Viewer Left): from elbow 92,400 to fingers 60,500
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '70,360 145,360 120,440 85,505 20,490 35,420',
  `${outDir}/warrior_right_forearm.png`
);

// 4. Warrior Left Upper Arm (Viewer Right): from shoulder 510,300 to elbow 586,442
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '490,260 620,330 630,420 540,430 480,350',
  `${outDir}/warrior_left_upper_arm.png`
);

// 5. Warrior Left Forearm & Hand (Viewer Right): from elbow 586,442 to hand 730,560
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '540,410 640,410 730,510 730,570 650,560 560,470',
  `${outDir}/warrior_left_forearm.png`
);

// 6. Warrior Right Thigh (Viewer Left): from hip 260,680 down towards knee 170,856
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '220,640 330,640 300,770 240,840 180,820 180,720',
  `${outDir}/warrior_right_thigh.png`
);

// 7. Warrior Right Shin & Boot (Viewer Left): from knee 170,856 to toe 120,950
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '160,810 260,810 230,945 120,955 120,880',
  `${outDir}/warrior_right_shin.png`
);

// 8. Warrior Left Leg (Viewer Right Shin & Boot): from knee 520,665 to toe 650,920
extractPart(
  `${outDir}/warrior_cleaned.png`,
  '480,640 600,640 650,920 520,920 480,750',
  `${outDir}/warrior_left_leg.png`
);

// 9. Warrior Torso: chest armor, belt, and skirts (with arms and head erased)
run(`convert "${outDir}/warrior_cleaned.png" \\
  \\( -size 730x980 xc:black -fill white \\
     -draw "polygon 220,180 540,180 620,400 630,730 450,780 120,730 110,500 230,400" \\) \\
  -alpha off -compose CopyOpacity -composite "${outDir}/warrior_torso.png"`);

console.log('--- Step 4: Extract Scholar Segments ---');
function extractScholarPart(source, polygonPoints, outputFile) {
  const maskCmd = `convert "${source}" \\
    \\( -size 720x980 xc:black -fill white -draw "polygon ${polygonPoints}" \\) \\
    -alpha off -compose CopyOpacity -composite "${outputFile}"`;
  run(maskCmd);
}

// 1. Scholar Head: cap, face, ribbons
extractScholarPart(
  `${outDir}/scholar_cleaned.png`,
  '270,10 470,10 480,210 380,250 280,210 270,120',
  `${outDir}/scholar_head.png`
);

// 2. Scholar Right Arm + Fan (Viewer Left): holding folding fan
extractScholarPart(
  `${outDir}/scholar_cleaned.png`,
  '40,100 250,100 320,300 270,390 130,420 100,280',
  `${outDir}/scholar_right_arm.png`
);

// 3. Scholar Left Arm + Sleeve (Viewer Right): flowing blue/white embroidered sleeve
extractScholarPart(
  `${outDir}/scholar_cleaned.png`,
  '410,240 540,240 700,480 690,620 560,610 430,380',
  `${outDir}/scholar_left_arm.png`
);

// 4. Scholar Torso: gown body and pleated skirts
extractScholarPart(
  `${outDir}/scholar_cleaned.png`,
  '280,200 460,200 480,420 620,890 140,890 280,450',
  `${outDir}/scholar_torso.png`
);

// 5. Scholar Shoes / Bottom Trim
extractScholarPart(
  `${outDir}/scholar_cleaned.png`,
  '140,860 620,860 620,950 140,950',
  `${outDir}/scholar_shoes.png`
);

console.log('Puppet segment extraction completed!');
