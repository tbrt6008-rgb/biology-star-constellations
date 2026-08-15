import './styles.css';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap.config.js';
import * as THREE from 'three';

window.BiologyVaultMotion = {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
};

window.__debug_vault = {
  getScientists: () => scientists,
  getScientistMap: () => scientistMap,
  showPoster: (s, opts) => showPoster(s, opts),
};

// ═══════════════════════════════════════════════════════════════

//  常量 & 配置

// ═══════════════════════════════════════════════════════════════

let ceremonyActive = false;
let ceremonyScientist = null;
let ceremonyFadeOpacity = 1.0;
let isCardOpening = false;
let scrollCinematicParallaxCleanup = null;

const CONSTIT_COLORS = {

  1: {h:185, s:75, l:58, hex:'#2dd4e8'},

  2: {h:42,  s:88, l:58, hex:'#f0b030'},

  3: {h:280, s:65, l:68, hex:'#c070f0'},

  4: {h:130, s:62, l:55, hex:'#50d080'},

  5: {h:210, s:78, l:62, hex:'#4090ff'},

};

const CONSTIT_LABELS = {

  1:'白羊 · 分子与细胞',

  2:'巨蟹 · 遗传与进化',

  3:'金牛 · 稳态与调节',

  4:'双子 · 生物与环境',

  5:'狮子 · 生物技术与工程',

};

// 星宿中心点（归一化屏幕空间坐标 [-1, 1]，分别对应不同象限以防重叠）

const CONSTELLATION_CENTERS = {

  1: { x: -0.32, y: -0.28 }, // 必修一：左上

  2: { x: 0.32,  y: -0.28 }, // 必修二：右上

  3: { x: -0.28, y: 0.32 },  // 选必一：左下

  4: { x: 0.30,  y: 0.30 },  // 选必二：右下

  5: { x: 0.0,   y: -0.05 }, // 选必三：居中偏上

};

const RELATION_CONSTELLATION_CENTERS = [
  { x: -0.46, y: -0.40 }, { x: -0.14, y: -0.43 }, { x: 0.18, y: -0.40 }, { x: 0.48, y: -0.34 },
  { x: -0.42, y: -0.08 }, { x: -0.10, y: -0.10 }, { x: 0.20, y: -0.06 }, { x: 0.46, y: 0.02 },
  { x: -0.36, y: 0.28 }, { x: -0.08, y: 0.32 }, { x: 0.22, y: 0.30 }, { x: 0.48, y: 0.28 },
];

const RELATION_CONSTELLATION_TEMPLATES = [
  [[-0.72,-0.42],[-0.36,-0.08],[-0.08,-0.34],[0.18,0.08],[0.58,-0.02],[0.76,0.38]],
  [[-0.62,0.42],[-0.40,-0.12],[-0.08,-0.44],[0.22,-0.08],[0.56,-0.34],[0.72,0.18]],
  [[-0.64,-0.10],[-0.30,-0.44],[0.02,-0.04],[0.34,-0.36],[0.64,0.10],[0.18,0.42]],
  [[-0.58,-0.42],[-0.46,0.02],[-0.18,0.34],[0.18,0.02],[0.50,0.38],[0.62,-0.24]],
  [[-0.72,0.10],[-0.36,-0.24],[-0.04,-0.06],[0.20,-0.38],[0.46,0.02],[0.72,0.30]],
  [[-0.54,-0.36],[-0.20,-0.02],[-0.50,0.34],[-0.04,0.48],[0.28,0.14],[0.58,-0.22]],
  [[-0.66,0.32],[-0.30,0.02],[0.02,0.28],[0.30,-0.06],[0.04,-0.40],[0.62,-0.28]],
  [[-0.70,-0.18],[-0.36,-0.38],[-0.02,-0.10],[0.34,-0.28],[0.58,0.06],[0.24,0.42]],
  [[-0.60,0.38],[-0.24,0.06],[0.08,0.30],[0.38,0.04],[0.10,-0.30],[0.64,-0.42]],
  [[-0.54,-0.10],[-0.22,-0.42],[0.06,-0.12],[0.38,-0.34],[0.62,0.06],[0.08,0.42]],
  [[-0.66,-0.36],[-0.34,-0.04],[-0.02,-0.24],[0.28,0.08],[0.02,0.36],[0.58,0.42]],
  [[-0.58,0.02],[-0.34,-0.34],[-0.08,-0.02],[0.18,-0.40],[0.46,-0.08],[0.66,0.34]],
];

const CONSTIT_SPEEDS = [0, 0.0005, 0.00038, 0.00028, 0.00018, 0.00012];

const PY = 0.35, TL = 0.055;

// ═══════════════════════════════════════════════════════════════

//  全局状态

// ═══════════════════════════════════════════════════════════════

let scientists = [], scientistMap = {};

let methods = [], methodsMap = {};

let stories = [], storyMap = {};

let W, H, CX, CY, SC;

let filterConstellation = 0, coreOnly = false, searchQuery = '';

let hoveredId = null, selectedId = null;

let connectionLines = []; 

let constellationLinks = []; 

let skeletalLinks = []; // 全局星座骨架连线数组

let frame = 0, galaxyT = 0;

// 虚拟相机系统

const camera = {

  x: 0,

  y: 0,

  zoom: 1.0,

  targetX: 0,

  targetY: 0,

  targetZoom: 1.0,

  activeConstellation: null // 当前聚焦的教材星座 (1-5) 或 null

};

// 星座名字与中心浮动标题

const CONSTELLATION_NAMES = {

  1: { cn: "白羊", en: "Aries", icon: "🌌 白羊 · 分子与细胞" },

  2: { cn: "巨蟹", en: "Cancer", icon: "🧬 巨蟹 · 遗传与进化" },

  3: { cn: "金牛", en: "Taurus", icon: "🌿 金牛 · 稳态与调节" },

  4: { cn: "双子", en: "Gemini", icon: "🦊 双子 · 生物与环境" },

  5: { cn: "狮子", en: "Leo",    icon: "🧪 狮子 · 生物技术与工程" }

};

let constellationLabelBounds = {}; // 保存每个标签在画布上的包围盒以供点击/悬停检测

let hoveredConstellation = null; // 当前鼠标悬停的星座标签 ID (1-5) 或 null

// Awwwards 动效状态变量

let mouseX = -9999;

let mouseY = -9999;

let folX = window.innerWidth / 2;

let folY = window.innerHeight / 2;

let isMouseOnCanvas = false;

let followerRadius = 14;

let lastHoveredId = null;

let typewriterText = '';

let typewriterIndex = 0;

let typewriterInterval = null;

// 星点

const STARS = Array.from({length:700}, () => ({

  x: Math.random(), y: Math.random(),

  r: Math.pow(Math.random(), 2.5) * 1.6 + 0.15,

  a: 0.2 + Math.random() * 0.8,

  ph: Math.random() * Math.PI * 2,

  sp: 0.008 + Math.random() * 0.032,

  depth: 0.02 + Math.random() * 0.25, // 视差系数

}));

// ═══════════════════════════════════════════════════════════════

//  Canvas & resize

// ═══════════════════════════════════════════════════════════════

const cv = document.getElementById('c');

const ctx = cv.getContext('2d');

function resize() {

  const topbar = document.getElementById('topbar');
  const topbarHeight = topbar ? topbar.offsetHeight : 54;

  W = cv.width  = window.innerWidth;

  H = cv.height = Math.max(320, window.innerHeight - topbarHeight);

  CX = W / 2;

  CY = H * 0.50;

  SC = Math.min(W / 1440, (H - 60) / 640);

}

window.addEventListener('resize', resize);

resize();

function toXY(angle, r) {

  const a = angle + TL;

  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r * PY };

}

function constellationR(constellation) { return 0; } // 废弃老轨道半径函数

// ═══════════════════════════════════════════════════════════════

//  数据加载

// ═══════════════════════════════════════════════════════════════

function shuffle(array) {

  for (let i = array.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];

  }

  return array;

}

function pointOnTemplate(template, index, count) {
  if (count <= 1) return { x: 0, y: 0 };

  const pathIndex = (index / (count - 1)) * (template.length - 1);
  const left = Math.floor(pathIndex);
  const right = Math.min(template.length - 1, left + 1);
  const mix = pathIndex - left;
  const a = template[left];
  const b = template[right];

  return {
    x: a[0] + (b[0] - a[0]) * mix,
    y: a[1] + (b[1] - a[1]) * mix,
  };
}

function addSkeletalLink(from, to, meta, seenLinks) {
  if (!from || !to || from.id === to.id) return;

  const key = [from.id, to.id].sort().join('-');
  if (seenLinks.has(key)) return;

  seenLinks.add(key);
  from._connections.add(to.id);
  to._connections.add(from.id);
  skeletalLinks.push({ from, to, ...meta });
}

function applyRelationshipConstellationLayout() {
  const topicToScientists = new Map();

  for (const s of scientists) {
    s._connections = new Set();
    s._constellationTopic = null;
    s._constellationIndex = null;

    for (const topic of s._cleanedInts || []) {
      if (!topic || scientistMap[topic]) continue;
      if (!topicToScientists.has(topic)) topicToScientists.set(topic, []);
      topicToScientists.get(topic).push(s);
    }
  }

  const selectedTopics = [...topicToScientists.entries()]
    .map(([name, members]) => ({
      name,
      members: [...new Map(members.map(member => [member.id, member])).values()]
        .sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0) || a.id.localeCompare(b.id)),
    }))
    .filter(topic => topic.members.length >= 2)
    .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name))
    .slice(0, 12);

  const primaryTopicByScientist = new Map();

  for (const topic of selectedTopics) {
    for (const s of topic.members) {
      if (!primaryTopicByScientist.has(s.id)) {
        primaryTopicByScientist.set(s.id, topic.name);
      }
    }
  }

  skeletalLinks = [];
  const seenLinks = new Set();
  const assigned = new Set();

  selectedTopics.forEach((topic, topicIndex) => {
    const center = RELATION_CONSTELLATION_CENTERS[topicIndex];
    const template = RELATION_CONSTELLATION_TEMPLATES[topicIndex % RELATION_CONSTELLATION_TEMPLATES.length];
    const members = topic.members.filter(s => primaryTopicByScientist.get(s.id) === topic.name);
    const scale = 74 + Math.min(28, members.length * 4);

    members.forEach((s, index) => {
      const p = pointOnTemplate(template, index, members.length);
      s._layoutCenter = center;
      s._relX = p.x * scale + (Math.random() - 0.5) * 4;
      s._relY = p.y * scale + (Math.random() - 0.5) * 4;
      s._constellationTopic = topic.name;
      s._constellationIndex = topicIndex + 1;
      assigned.add(s.id);
    });

    for (let i = 0; i < members.length - 1; i++) {
      addSkeletalLink(members[i], members[i + 1], {
        type: 'topic',
        topic: topic.name,
        constellationIndex: topicIndex + 1,
      }, seenLinks);
    }
  });

  const fallbackCells = RELATION_CONSTELLATION_CENTERS;
  const fallbackStars = scientists
    .filter(s => !assigned.has(s.id))
    .sort((a, b) => a.constellation - b.constellation || (b.magnitude || 0) - (a.magnitude || 0) || a.id.localeCompare(b.id));

  fallbackStars.forEach((s, index) => {
    const cell = fallbackCells[index % fallbackCells.length];
    const ring = Math.floor(index / fallbackCells.length);
    const angle = index * 2.3999632297;
    const radius = 28 + ring * 9 + ((index % 3) * 5);

    s._layoutCenter = cell;
    s._relX = Math.cos(angle) * radius;
    s._relY = Math.sin(angle) * radius;
  });

  for (const s of scientists) {
    for (const target of s._cleanedInts || []) {
      const t = scientistMap[target];
      if (t && s._constellationIndex && s._constellationIndex === t._constellationIndex) {
        addSkeletalLink(s, t, {
          type: 'direct',
          topic: `${s._cnName || s.id} / ${t._cnName || t.id}`,
          constellationIndex: s._constellationIndex || t._constellationIndex || null,
        }, seenLinks);
      }
    }
  }
}

async function loadData() {

  const loadingText = document.querySelector('#boot-status-text');
  if (loadingText) loadingText.textContent = '正在加载科学家数据...';

  const res = await fetch('scientists.json');

  const data = await res.json();

  scientists = data.scientists;

  // 建立查找表并初始化行星个性化特征

  for (const s of scientists) {

    scientistMap[s.id] = s;

    // 取中文名部分（如"孟德尔 (Gregor Mendel)" → "孟德尔"）

    const cnName = s.name.split(/[\s(（]/)[0];

    scientistMap[cnName] = s;

    s._cnName = cnName;

    // 生成随机变异系数：大小、亮度、自转

    s._sizeScale = 0.82 + Math.random() * 0.36; // 大小变异：0.82 - 1.18倍

    s._brightness = 1.0; 

    s._rotSpeed = (0.0015 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1); 

    s._connections = new Set();

  }

  // 1.5 加载科学方法数据

  try {

    if (loadingText) loadingText.textContent = '正在加载科学方法数据库...';

    const resM = await fetch('methods.json');

    const dataM = await resM.json();

    methods = dataM.methods || [];

    for (const m of methods) {

      methodsMap[m.id] = m;

      methodsMap[m.title] = m;

    }

    console.log(`已成功加载 ${methods.length} 个科学方法。`);

  } catch (e) {

    console.error('加载 methods.json 失败', e);

  }

  // 1b. 加载故事档案（02_Discoveries + 05_Galaxy_Collision + 00_Starry_Map）

  try {

    const resS = await fetch('stories.json');

    const dataS = await resS.json();

    stories = dataS.stories || [];

    for (const st of stories) {

      storyMap[st.id] = st;

    }

    console.log(`已成功加载 ${stories.length} 个故事档案。`);

  } catch (e) {

    console.error('加载 stories.json 失败', e);

  }

  // 2. 加载3D星球表面纹理贴图列表

  if (loadingText) loadingText.textContent = '正在检索3D星球表面纹理...';

  let imageFiles = [];

  try {

    const imgRes = await fetch('images.json');

    imageFiles = await imgRes.json();

  } catch (e) {

    console.warn('无法加载images.json，将降级使用程序化渐变色星球。', e);

  }

  // 3. 为每个科学家分配贴图并预加载

  if (imageFiles.length > 0) {

    // 随机打乱贴图文件，使贴图分配杂乱无章

    shuffle(imageFiles);

    let loadedImages = 0;

    const totalToLoad = scientists.length;

    const loadPromises = scientists.map((s, idx) => {

      return new Promise((resolve) => {

        const file = imageFiles[idx % imageFiles.length];

        s._textureImg = new Image();

        s._textureImg.src = 'Images/' + file;

        s._textureImg.onload = () => {

          s._textureLoaded = true;

          loadedImages++;

          if (loadingText) loadingText.textContent = `正在预加载星球表面纹理 (${loadedImages}/${totalToLoad})...`;

          resolve();

        };

        s._textureImg.onerror = () => {

          s._textureLoaded = false;

          loadedImages++;

          resolve(); // 容错继续

        };

        // 4秒超时保护

        setTimeout(resolve, 4000);

      });

    });

    await Promise.all(loadPromises);

  }

  // 3.5 预先提取清洗每位科学家的学术关联信息 (Clean up intersection links first)
  function cleanItem(item) {
    if (!item) return '';
    item = item.trim();
    if (item.startsWith('[') && item.endsWith(']')) {
      item = item.slice(1, -1).trim();
    }
    if ((item.startsWith("'") && item.endsWith("'")) || (item.startsWith('"') && item.endsWith('"'))) {
      item = item.slice(1, -1).trim();
    }
    return item.replace(/\[\[/g, '').replace(/\]\]/g, '').trim();
  }

  for (const s of scientists) {
    let cleaned = [];
    const rawInt = s.intersection || [];
    for (let item of rawInt) {
      if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']')) {
        try {
          let parsed = JSON.parse(item.replace(/'/g, '"'));
          if (Array.isArray(parsed)) {
            for (let x of parsed) {
              cleaned.push(cleanItem(x));
            }
            continue;
          }
        } catch (e) {}
      }
      cleaned.push(cleanItem(item));
    }
    s._cleanedInts = cleaned;
  }

  // 4. 为每位科学家根据其所属教材分配独特的星座骨架相对位置 (Zodiac Constellation Layout)

  const groups = {1:[], 2:[], 3:[], 4:[], 5:[]};

  for (const s of scientists) groups[s.constellation].push(s);

  skeletalLinks = []; // 重置全局星座骨架连线数组

  for (let constellation = 1; constellation <= 5; constellation++) {

    const grp = groups[constellation];

    // 4.1 建立当前星轨/星座内的科学家关联邻接表，以关系连通性进行宽度优先搜索（BFS）重排序，
    // 确保有学术联系的科学家在几何空间上被相邻放置，使得星座连线优雅非交叉
    let adj = {};
    for (const s of grp) {
      adj[s.id] = [];
    }
    for (const s of grp) {
      const ints = s._cleanedInts || [];
      for (const target of ints) {
        const t = scientistMap[target];
        if (t && t.constellation === constellation && t.id !== s.id) {
          if (!adj[s.id].includes(t.id)) adj[s.id].push(t.id);
          if (!adj[t.id].includes(s.id)) adj[t.id].push(s.id);
        }
      }
    }

    let sortedGrp = [];
    let visited = new Set();
    let startNodes = [...grp].sort((a, b) => b.magnitude - a.magnitude || a.id.localeCompare(b.id));

    for (const startNode of startNodes) {
      if (!visited.has(startNode.id)) {
        let queue = [startNode];
        visited.add(startNode.id);
        while (queue.length > 0) {
          let curr = queue.shift();
          sortedGrp.push(curr);
          
          let neighbors = adj[curr.id]
            .map(id => scientistMap[id])
            .sort((a, b) => b.magnitude - a.magnitude || a.id.localeCompare(b.id));
            
          for (let neighbor of neighbors) {
            if (!visited.has(neighbor.id)) {
              visited.add(neighbor.id);
              queue.push(neighbor);
            }
          }
        }
      }
    }

    // 更新 grp 的排列顺序
    grp.length = 0;
    for (const s of sortedGrp) {
      grp.push(s);
    }

    const N = grp.length;

    if (N === 0) continue;

    // 分配相对位置

    grp.forEach((s, i) => {

      const t = N > 1 ? i / (N - 1) : 0.5;

      let rx = 0, ry = 0;

      if (constellation === 1) {

        // 🌌 白羊 (Aries)：一条优美延伸的折线/弧线

        rx = (t - 0.5) * 260;

        ry = (t - 0.25) * 60 - Math.cos(t * Math.PI) * 45;

      } else if (constellation === 2) {

        // 🧬 巨蟹 (Cancer)：倒Y字形分叉骨架

        const N_stem = Math.floor(0.4 * (N - 1)) + 1;

        const N_left = Math.floor(0.3 * (N - 1));

        if (i < N_stem) {

          // 主干

          const u = N_stem > 1 ? i / (N_stem - 1) : 0.5;

          rx = -15 + u * 15;

          ry = -110 + u * 75;

        } else if (i < N_stem + N_left) {

          // 左分叉

          const u = N_left > 1 ? (i - N_stem) / (N_left - 1) : 0.5;

          rx = 0 - u * 95;

          ry = -35 + u * 125;

        } else {

          // 右分叉

          const N_right = N - N_stem - N_left;

          const u = N_right > 1 ? (i - N_stem - N_left) / (N_right - 1) : 0.5;

          rx = 0 + u * 95;

          ry = -35 + u * 125;

        }

      } else if (constellation === 3) {

        // 🌿 金牛 (Taurus)：V字形牛头 + 两条长延伸角

        const N_horn1 = Math.floor(0.28 * (N - 1)) + 1;

        const N_horn2 = Math.floor(0.28 * (N - 1)) + 1;

        if (i < N_horn1) {

          // 左牛角

          const u = N_horn1 > 1 ? i / (N_horn1 - 1) : 0.5;

          rx = -140 + u * 100;

          ry = -135 + u * 80;

        } else if (i < N_horn1 + N_horn2) {

          // 右牛角

          const u = N_horn2 > 1 ? (i - N_horn1) / (N_horn2 - 1) : 0.5;

          rx = 140 - u * 100;

          ry = -135 + u * 80;

        } else {

          // V形头部

          const N_v = N - N_horn1 - N_horn2;

          const u = N_v > 1 ? (i - N_horn1 - N_horn2) / (N_v - 1) : 0.5;

          if (u <= 0.5) {

            const v = u / 0.5;

            rx = -40 + v * 40;

            ry = -55 + v * 120;

          } else {

            const v = (u - 0.5) / 0.5;

            rx = v * 40;

            ry = 65 - v * 120;

          }

        }

      } else if (constellation === 4) {

        // 🦊 双子 (Gemini)：两条平行的双子线

        const idx_half = Math.floor(0.5 * N);

        if (i < idx_half) {

          // 左子

          const u = idx_half > 1 ? i / (idx_half - 1) : 0.5;

          rx = -50;

          ry = -120 + u * 240;

        } else {

          // 右子

          const N_right = N - idx_half;

          const u = N_right > 1 ? (i - idx_half) / (N_right - 1) : 0.5;

          rx = 50;

          ry = -120 + u * 240;

        }

      } else {

        // 🧪 狮子 (Leo)：镰刀弯钩头部 + 三角形身躯 + 延伸的尾巴

        const N_sickle = Math.floor(0.35 * (N - 1)) + 1;

        const N_body = Math.floor(0.45 * (N - 1)) + 1;

        if (i < N_sickle) {

          // 镰刀弯钩头部

          const u = N_sickle > 1 ? i / (N_sickle - 1) : 0.5;

          const a = u * 1.45 * Math.PI - 0.15 * Math.PI;

          rx = 45 + Math.cos(a) * 55;

          ry = -45 + Math.sin(a) * 55;

        } else if (i < N_sickle + N_body) {

          // 三角形身躯

          const u = N_body > 1 ? (i - N_sickle) / (N_body - 1) : 0.5;

          if (u <= 0.33) {

            const v = u / 0.33;

            rx = 45 - v * 115;

            ry = 10;

          } else if (u <= 0.67) {

            const v = (u - 0.33) / 0.34;

            rx = -70;

            ry = 10 - v * 55;

          } else {

            const v = (u - 0.67) / 0.33;

            rx = -70 + v * 115;

            ry = -45 + v * 55;

          }

        } else {

          // 延伸的尾巴

          const N_tail = N - N_sickle - N_body;

          const u = N_tail > 1 ? (i - N_sickle - N_body) / (N_tail - 1) : 0.5;

          rx = -70 - u * 75;

          ry = -45 + u * 25;

        }

      }

      // 添加微弱的随机扰动 (Organic Jitter) 以保持宇宙星空的灵动天然感，防止过于死板

      s._relX = rx + (Math.random() - 0.5) * 6;

      s._relY = ry + (Math.random() - 0.5) * 6;

      s._phaseX = Math.random() * Math.PI * 2;

      s._phaseY = Math.random() * Math.PI * 2;

    });

  }

  skeletalLinks = [];
  let seenLinks = new Set();

  // 4.5.1 直系科学家关联 (例如：赫尔希 <-> 蔡斯，沃森 <-> 克里克)
  for (const s of scientists) {
    for (const target of s._cleanedInts) {
      if (scientistMap[target]) {
        const t = scientistMap[target];
        if (s.id !== t.id) {
          const key = [s.id, t.id].sort().join('-');
          if (!seenLinks.has(key)) {
            seenLinks.add(key);
            skeletalLinks.push({ from: s, to: t, type: 'direct', constellation: s.constellation });
          }
        }
      }
    }
  }

  // 4.5.2 共享同一科学实验/发现课题的科学家关联 (例如：光合作用探究实验中的跨越百年接力)
  let topicToScientists = {};
  for (const s of scientists) {
    for (const target of s._cleanedInts) {
      if (target && !scientistMap[target]) {
        if (!topicToScientists[target]) {
          topicToScientists[target] = [];
        }
        topicToScientists[target].push(s);
      }
    }
  }

  for (const topic in topicToScientists) {
    const members = topicToScientists[topic];
    if (members.length > 1) {
      // 按照重要程度（magnitude）和学名（id）排序，保证星座连线形态稳定
      members.sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0) || a.id.localeCompare(b.id));
      for (let i = 0; i < members.length - 1; i++) {
        const s1 = members[i];
        const s2 = members[i+1];
        const key = [s1.id, s2.id].sort().join('-');
        if (!seenLinks.has(key)) {
          seenLinks.add(key);
          skeletalLinks.push({ from: s1, to: s2, type: 'topic', constellation: s1.constellation });
        }
      }
    }
  }

  applyRelationshipConstellationLayout();

  constellationLinks = [];

  // ── 视频背景无缝循环 + 进入按钮 ──
  initBootVideoLoop();

  const bootBtn = document.getElementById('btn-init-system');
  if (bootBtn) {
    bootBtn.style.display = 'block';
    bootBtn.addEventListener('click', () => exitBootSequence());

    // ── 无缝入口：从 VOYAGER 落地页带 ?autoboot=1 进入，直接进入星空 ──
    if (new URLSearchParams(location.search).get('autoboot') === '1') {
      exitBootSequence();
    }
  }

  updateCount();

  // Hide the canvas and hud elements initially
  gsap.set(['#c', '#hud-telemetry', '.scanlines', '.vignette'], { opacity: 0 });

  requestAnimationFrame(render);

}

// 地球升起视频背景：鼠标方向驱动播放（scrub）
// 鼠标左移 → 正放（地球推近）；右移 → 倒放（地球退远）；停 → 暂停；到边界 clamp
// 无循环跳变问题——播放方向完全由用户控制
function initBootVideoLoop() {
  const v = document.getElementById('boot-video');
  if (!v) return;

  const SRC = import.meta.env.BASE_URL + 'design-assets/hero-earth-rise.mp4';
  const DUR = 12.0; // 视频总时长（s）

  // 触屏/无鼠标：回退到原生自动循环播放
  const hasMouse = window.matchMedia('(hover: hover)').matches;
  if (!hasMouse) {
    v.src = SRC;
    v.loop = true;
    v.play().catch(() => {});
    return;
  }

  // 检测负 playbackRate（Chrome/Edge 支持倒放；Safari 不支持 → 用逐帧 seek）
  let supportsReverse = false;
  try {
    v.playbackRate = -1;
    supportsReverse = v.playbackRate < 0;
    v.playbackRate = 1;
  } catch (_) { supportsReverse = false; }

  v.src = SRC;
  v.muted = true;
  v.currentTime = 0;

  let lastX = null;
  let targetVel = 0; // 目标视频速度（秒/秒，负=倒放）
  let vel = 0;       // 平滑后的速度
  let pos = 0;       // 逐帧 seek 模式下的逻辑位置

  window.addEventListener('mousemove', (e) => {
    if (lastX === null) { lastX = e.clientX; return; }
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    // 左移 → 正放（+）；右移 → 倒放（-）；速度随位移量变化（上限 6x，灵敏响应）
    const dir = dx < 0 ? 1 : (dx > 0 ? -1 : 0);
    targetVel = dir * Math.min(Math.abs(dx) * 0.06, 6.0);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    targetVel = 0;
    lastX = null;
  });

  function tick() {
    vel += (targetVel - vel) * 0.25; // 速度平滑（响应更灵敏）
    if (Math.abs(vel) < 0.002 && Math.abs(targetVel) < 0.002) vel = 0;

    if (Math.abs(vel) < 0.002) {
      // 鼠标静止 → 暂停（仅当本就在播放/倒放时）
      if (!v.paused) v.pause();
    } else if (supportsReverse) {
      // 原生方向播放：playbackRate 正负即方向
      if (vel > 0 && v.currentTime >= DUR - 0.05) { vel = 0; targetVel = 0; v.pause(); }
      else if (vel < 0 && v.currentTime <= 0.01)  { vel = 0; targetVel = 0; v.pause(); v.currentTime = 0; }
      else {
        v.playbackRate = vel;
        if (v.paused) v.play().catch(() => {});
      }
    } else {
      // fallback：逐帧 seek（Chrome/Firefox 不支持负 playbackRate）
      if (Math.abs(v.currentTime - pos) > 0.5) pos = v.currentTime; // 外部 seek 时同步
      pos += vel / 60;
      pos = Math.min(Math.max(pos, 0), DUR - 0.05);
      if (Math.abs(v.currentTime - pos) > 0.001) v.currentTime = pos;
      if (pos <= 0.001 || pos >= DUR - 0.05) { vel = 0; targetVel = 0; v.pause(); }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// 「PRESS TO INITIALIZE」点击后：淡出开机层 + 星空 fade in
function exitBootSequence() {
  const systemBootContainer = document.getElementById('system-boot');
  const bootBtn = document.getElementById('btn-init-system');
  if (bootBtn) bootBtn.style.display = 'none';

  // 视频随容器一起淡出，然后暂停释放资源
  gsap.to(systemBootContainer, {
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      systemBootContainer.style.display = 'none';
      const v = document.getElementById('boot-video');
      if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_) {} }
    }
  });

  // Fade in effects and UI
  gsap.to(['.scanlines', '.vignette'], { opacity: 1, duration: 2.0, ease: "power2.inOut", stagger: 0.2 });
  gsap.to('#c', { opacity: 1, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
  gsap.to('#hud-telemetry', { opacity: 1, duration: 1.5, ease: "power2.out", delay: 1.2 });

  // Fade in stars (fireflies effect)
  STARS.forEach(s => {
    gsap.to(s, {
      a: s._targetA,
      duration: 2.0 + Math.random() * 3.0,
      delay: 1.0 + Math.random() * 2.0,
      ease: "power1.inOut"
    });
  });
}

// ═══════════════════════════════════════════════════════════════

//  过滤 & 搜索

// ═══════════════════════════════════════════════════════════════

function isVisible(s) {

  if (filterConstellation > 0 && s.constellation !== filterConstellation) return false;

  if (coreOnly && s.priority_level < 3) return false;

  return true;

}

function matchSearch(s) {

  if (!searchQuery) return true;

  const q = searchQuery;

  return [s.name, s.id, s.identity, s.quick_recall, ...s.focus].join(' ').toLowerCase().includes(q);

}

function updateCount() {

  const vis = scientists.filter(isVisible);

  const matched = vis.filter(matchSearch);

  const countBadge = document.getElementById('count-badge');

  if (countBadge) {

    countBadge.textContent =

      searchQuery ? `${matched.length} / ${vis.length} 位` : `${vis.length} 位科学家`;

  }

  const missionCount = document.getElementById('mission-count');
  if (missionCount) missionCount.textContent = String(matched.length);

}

function updateMissionDossier(s, state = 'idle') {
  const stateEl = document.getElementById('mission-focus-state');
  const nameEl = document.getElementById('mission-focus');
  const copyEl = document.getElementById('mission-focus-copy');
  const constellationEl = document.getElementById('mission-focus-constellation');
  const coreEl = document.getElementById('mission-focus-core');
  const panel = document.getElementById('constellation-dossier');

  if (!stateEl || !nameEl || !copyEl || !constellationEl || !coreEl || !panel) return;

  if (!s) {
    panel.classList.remove('previewing', 'locked');
    stateEl.textContent = 'SELECTED NODE';
    nameEl.textContent = '点击任意星点';
    copyEl.textContent = '右侧档案将呈现人物、教材位置、实验方法与考法提醒。';
    constellationEl.textContent = '--';
    coreEl.textContent = '--';
    return;
  }

  panel.classList.toggle('previewing', state === 'preview');
  panel.classList.toggle('locked', state === 'locked');
  stateEl.textContent = state === 'locked' ? 'LOCKED DOSSIER' : 'NODE PREVIEW';
  nameEl.textContent = s._cnName || s.id;
  copyEl.textContent = s.quick_recall || s.identity || '打开档案查看教材位置、实验方法与考法提醒。';
  constellationEl.textContent = CONSTIT_LABELS[s.constellation]?.split(' · ')[0] || `Constellation ${s.constellation}`;
  coreEl.textContent = (s.priority_level === 3 || s.magnitude >= 5) ? 'HIGH' : `${s.magnitude || 3}/5`;
}

// ═══════════════════════════════════════════════════════════════

//  行星颜色 & 大小

// ═══════════════════════════════════════════════════════════════

function planetRadius(s) {

  // 外轨行星放大，magnitude大的也更大，并乘以个性化随机大小变异系数

  const constellationBoost = (s.constellation >= 4) ? 1.3 : 1.0;

  const baseSize = [0, 5, 8, 12, 17, 22][s.magnitude] || 8;

  return baseSize * SC * constellationBoost * (s._sizeScale || 1.0);

}

function constellationColor(constellation, alpha=1) {

  const c = CONSTIT_COLORS[constellation];

  return `hsla(${c.h},${c.s}%,${c.l}%,${alpha})`;

}

function getScientistVisual(s) {
  const c = CONSTIT_COLORS[s.constellation] || CONSTIT_COLORS[2];
  const textureUrl = (s._textureImg && s._textureLoaded && s._textureImg.src) ? s._textureImg.src : '';

  return {
    hue: c.h,
    saturation: c.s,
    lightness: c.l,
    hex: c.hex,
    hsl: `hsl(${c.h},${c.s}%,${c.l}%)`,
    glow: `hsla(${c.h},${c.s}%,${c.l}%,0.32)`,
    textureUrl,
    textureImage: textureUrl ? s._textureImg : null,
  };
}

// fallback texture 全局缓存：按轨道颜色分组，同轨道共享 canvas（最多 5 个）
const _fallbackTextureCache = new Map();

function getPlanetTextureSource(s, size = 512) {
  if (s._lockedPlanetTextureSource) {
    return s._lockedPlanetTextureSource;
  }

  const visual = getScientistVisual(s);

  if (visual.textureImage) {
    return {
      source: visual.textureImage,
      url: visual.textureUrl,
      fromAsset: true,
    };
  }

  // fallback 按轨道颜色缓存（同轨道共享，避免 78 个 scientist 各生成一份）
  const cacheKey = `${visual.hue}_${visual.saturation}_${visual.lightness}_${size}`;
  if (!_fallbackTextureCache.has(cacheKey)) {
    const canvas = makeFallbackPlanetTexture(s, size);
    _fallbackTextureCache.set(cacheKey, {
      source: canvas,
      url: canvas.toDataURL('image/png'),
      fromAsset: false,
    });
  }
  return _fallbackTextureCache.get(cacheKey);
}

function makeFallbackPlanetTexture(s, size = 512) {
  const visual = getScientistVisual(s);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const gctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const base = gctx.createRadialGradient(cx * 0.48, cy * 0.42, 0, cx, cy, r);
  base.addColorStop(0, `hsl(${visual.hue + 4}, ${Math.max(42, visual.saturation - 6)}%, ${Math.min(76, visual.lightness + 10)}%)`);
  base.addColorStop(0.58, `hsl(${visual.hue}, ${visual.saturation}%, ${visual.lightness}%)`);
  base.addColorStop(1, `hsl(${visual.hue - 6}, ${Math.min(100, visual.saturation + 6)}%, ${Math.max(34, visual.lightness - 10)}%)`);
  gctx.fillStyle = base;
  gctx.fillRect(0, 0, size, size);

  gctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 42; i++) {
    const px = Math.abs((Math.sin(i * 21.77 + s.constellation) * 10937.31) % 1) * size;
    const py = Math.abs((Math.sin(i * 9.41 + s.id.length) * 30111.91) % 1) * size;
    gctx.strokeStyle = `rgba(255,255,255,${0.026 + (i % 4) * 0.008})`;
    gctx.lineWidth = 1 + (i % 3);
    gctx.beginPath();
    gctx.ellipse(px, py, size * (0.055 + (i % 5) * 0.009), size * 0.018, Math.sin(i) * Math.PI, 0, Math.PI * 2);
    gctx.stroke();
  }

  return canvas;
}

function positiveModulo(value, size) {
  return ((value % size) + size) % size;
}

function drawWrappedTextureOnSphere(targetCtx, textureImage, cx, cy, r, rotation = 0) {
  const width = textureImage.width || textureImage.naturalWidth;
  const height = textureImage.height || textureImage.naturalHeight;
  if (!width || !height || r <= 0) return;

  const step = r > 120 ? 2 : 1;
  const circumference = Math.PI * 2;

  for (let dx = -r; dx <= r; dx += step) {
    const u = Math.max(-1, Math.min(1, dx / r));
    const theta = Math.asin(u);
    const visibleHeight = Math.sqrt(Math.max(0, 1 - u * u)) * r * 2;
    const sourceCenter = positiveModulo((rotation + theta / circumference) * width, width);
    const nextTheta = Math.asin(Math.max(-1, Math.min(1, (dx + step) / r)));
    const sourceW = Math.max(1, Math.abs((nextTheta - theta) / circumference) * width + 1);
    const destX = cx + dx;
    const destY = cy - visibleHeight / 2;
    const destW = step + 0.7;

    if (sourceCenter + sourceW <= width) {
      targetCtx.drawImage(textureImage, sourceCenter, 0, sourceW, height, destX, destY, destW, visibleHeight);
    } else {
      const firstW = width - sourceCenter;
      const secondW = sourceW - firstW;
      const firstDestW = destW * (firstW / sourceW);
      targetCtx.drawImage(textureImage, sourceCenter, 0, firstW, height, destX, destY, firstDestW + 0.4, visibleHeight);
      targetCtx.drawImage(textureImage, 0, 0, secondW, height, destX + firstDestW, destY, destW - firstDestW + 0.4, visibleHeight);
    }
  }
}

function drawPlanetVolumeLighting(targetCtx, cx, cy, r, constellationColor, opacity = 1) {
  targetCtx.save();
  targetCtx.globalAlpha *= opacity;

  targetCtx.globalCompositeOperation = 'screen';
  const keyLight = targetCtx.createRadialGradient(cx - r * 0.42, cy - r * 0.46, 0, cx - r * 0.05, cy - r * 0.08, r * 1.08);
  keyLight.addColorStop(0, 'rgba(255,255,255,0.50)');
  keyLight.addColorStop(0.22, 'rgba(255,255,255,0.18)');
  keyLight.addColorStop(0.55, 'rgba(255,255,255,0.035)');
  keyLight.addColorStop(1, 'rgba(255,255,255,0)');
  targetCtx.fillStyle = keyLight;
  targetCtx.fillRect(cx - r, cy - r, r * 2, r * 2);

  const rimLight = targetCtx.createRadialGradient(cx + r * 0.78, cy + r * 0.02, 0, cx + r * 0.12, cy, r * 1.36);
  rimLight.addColorStop(0, 'rgba(106,166,255,0.40)');
  rimLight.addColorStop(0.18, 'rgba(68,136,255,0.22)');
  rimLight.addColorStop(0.42, 'rgba(68,136,255,0.055)');
  rimLight.addColorStop(1, 'rgba(68,136,255,0)');
  targetCtx.fillStyle = rimLight;
  targetCtx.fillRect(cx - r, cy - r, r * 2, r * 2);

  targetCtx.globalCompositeOperation = 'multiply';
  const terminator = targetCtx.createRadialGradient(cx - r * 0.34, cy - r * 0.38, r * 0.18, cx + r * 0.50, cy + r * 0.42, r * 1.34);
  terminator.addColorStop(0, 'rgba(255,255,255,0.98)');
  terminator.addColorStop(0.42, 'rgba(198,211,235,0.86)');
  terminator.addColorStop(0.74, 'rgba(70,86,124,0.48)');
  terminator.addColorStop(1, 'rgba(5,9,22,0.24)');
  targetCtx.fillStyle = terminator;
  targetCtx.fillRect(cx - r, cy - r, r * 2, r * 2);

  targetCtx.globalCompositeOperation = 'source-over';
  targetCtx.strokeStyle = `hsla(${constellationColor.h}, ${constellationColor.s}%, ${Math.min(92, constellationColor.l + 24)}%, 0.32)`;
  targetCtx.lineWidth = Math.max(0.7, r * 0.035);
  targetCtx.beginPath();
  targetCtx.arc(cx, cy, r - targetCtx.lineWidth * 0.5, 0, Math.PI * 2);
  targetCtx.stroke();

  targetCtx.restore();
}

function drawSphericalPlanet2D(targetCtx, s, cx, cy, r, frameValue, options = {}) {
  if (r <= 0) return;

  const c = CONSTIT_COLORS[s.constellation] || CONSTIT_COLORS[2];
  const textureSource = getPlanetTextureSource(s, options.textureSize || 512);
  const textureImage = textureSource.source;
  const rotation = positiveModulo(frameValue * (s._rotSpeed || 0.0032) * (options.rotationScale || 0.28), 1);

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.arc(cx, cy, r, 0, Math.PI * 2);
  targetCtx.clip();

  if (textureImage) {
    drawWrappedTextureOnSphere(targetCtx, textureImage, cx, cy, r, rotation);
  } else {
    const base = targetCtx.createRadialGradient(cx - r * 0.35, cy - r * 0.38, 0, cx + r * 0.20, cy + r * 0.18, r * 1.16);
    base.addColorStop(0, `hsl(${c.h + 8},${c.s}%,${Math.min(82, c.l + 22)}%)`);
    base.addColorStop(0.48, `hsl(${c.h},${c.s}%,${c.l}%)`);
    base.addColorStop(1, `hsl(${c.h - 12},${Math.min(100, c.s + 8)}%,${Math.max(18, c.l - 28)}%)`);
    targetCtx.fillStyle = base;
    targetCtx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  drawPlanetVolumeLighting(targetCtx, cx, cy, r, c, options.lightOpacity ?? 1);
  targetCtx.restore();

  if (options.atmosphere !== false) {
    targetCtx.save();
    targetCtx.globalAlpha *= options.atmosphereOpacity ?? 1;
    const aura = targetCtx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.45);
    aura.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${Math.min(86, c.l + 18)}%, 0.18)`);
    aura.addColorStop(0.28, 'rgba(68,136,255,0.11)');
    aura.addColorStop(1, 'rgba(68,136,255,0)');
    targetCtx.fillStyle = aura;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, r * 1.45, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════

//  绘制背景 & 星点

// ═══════════════════════════════════════════════════════════════

function drawBackground() {
  // The photographed galaxy field is the actual scene background.
  // Keep this canvas transparent so interaction layers do not cover it.
  return;

}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)'; // 1.2% opacity
  ctx.lineWidth = 0.5;
  
  const step = 90 * Math.max(0.5, Math.min(2.5, camera.zoom));
  const offsetX = (CX - camera.x * camera.zoom) % step;
  const offsetY = (CY - camera.y * camera.zoom) % step;
  
  ctx.beginPath();
  for (let x = offsetX; x < W; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = offsetY; y < H; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawStars() {

  ctx.save();

  for (const s of STARS) {

    const tw = 0.55 + 0.45 * Math.sin(frame * s.sp + s.ph);

    ctx.globalAlpha = s.a * tw * ceremonyFadeOpacity;

    ctx.fillStyle = '#e8eeff';

    // 视差位移计算，根据相机绝对偏移和恒星的景深层系数计算

    const dx = camera.x * s.depth;

    const dy = camera.y * s.depth;

    let sx = ((s.x * W - dx) % W + W) % W;

    let sy = ((s.y * H - dy) % H + H) % H;

    ctx.beginPath();

    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);

    ctx.fill();

  }

  ctx.restore();

}

// ═══════════════════════════════════════════════════════════════

function drawGalaxyCore() {

  const coreX = CX - camera.x * camera.zoom;

  const coreY = CY - camera.y * camera.zoom;

  const coreScale = camera.zoom;

  // 大辉光 (Spectacular Rainbow Nebula Aura)

  ctx.save();

  ctx.translate(coreX, coreY);

  ctx.scale(coreScale, coreScale * PY);

  const glow = ctx.createRadialGradient(0,0,2, 0,0,135*SC);

  glow.addColorStop(0,   'rgba(255, 235, 255, 0.95)'); // 白色核心带微粉

  glow.addColorStop(0.12,'rgba(220, 180, 255, 0.72)'); // 浅紫

  glow.addColorStop(0.32,'rgba(100, 150, 255, 0.42)'); // 幽蓝

  glow.addColorStop(0.65,'rgba(40, 70, 220, 0.12)');   // 深邃蓝

  glow.addColorStop(1,   'rgba(0,0,0,0)');

  ctx.beginPath();

  ctx.arc(0, 0, 135*SC, 0, Math.PI * 2);

  ctx.fillStyle = glow; ctx.fill();

  ctx.restore();

  // 螺旋臂 (High-Density Volumetric Rainbow Spiral Arms)

  const ARMS = 4;

  const PTS = 420; // 增加星点密度

  ctx.save();

  for (let arm=0; arm<ARMS; arm++) {

    const off = (arm/ARMS)*Math.PI*2;

    for (let i=0; i<PTS; i++) {

      const t = i/PTS;

      // 添加螺旋抖动，模拟真实的宇宙尘埃的毛糙云雾感 (Volumetric Nebula Jitter)

      const angleJitter = (Math.sin(i * 9.7 + arm) * 0.06) * (t + 0.05);

      const distJitter = (Math.cos(i * 12.3 - arm) * 3.5 * SC * coreScale) * (t + 0.05);

      const sa = t*Math.PI*4.2 + off + galaxyT + angleJitter;

      const d  = ((t*85+3)*SC * coreScale) + distJitter; // 增加星系半径至85

      const a = sa + TL;

      const armX = coreX + Math.cos(a) * d;

      const armY = coreY + Math.sin(a) * d * PY;

      ctx.globalAlpha = (1-t)*0.78+0.04;

      // 逆向 HSL 彩虹色谱映射：中心双色紫色 (320) -> 蓝色 -> 绿色 -> 黄色 -> 红色 (0)

      const hue = 320 - t * 320;

      const li = 82 - t * 36; // 越到外围，亮度渐暗

      ctx.fillStyle = `hsl(${hue},96%,${li}%)`;

      ctx.beginPath();

      // 近心处恒星较大，远心处恒星变为极小微尘

      ctx.arc(armX, armY, ((1-t)*2.8+0.4)*SC * coreScale, 0, Math.PI*2);

      ctx.fill();

    }

  }

  ctx.restore();

  // 核心亮点 (Luminous Galactic Bulge Nucleus)

  const core = ctx.createRadialGradient(coreX,coreY,0, coreX,coreY,22*SC * coreScale);

  core.addColorStop(0,'rgba(255,255,255,1)');

  core.addColorStop(0.35,'rgba(245,215,255,0.95)');

  core.addColorStop(0.8,'rgba(150,170,255,0.25)');

  core.addColorStop(1,'rgba(0,0,0,0)');

  ctx.beginPath(); ctx.arc(coreX,coreY,22*SC * coreScale,0,Math.PI*2);

  ctx.fillStyle=core; ctx.fill();

}

// ═══════════════════════════════════════════════════════════════

//  绘制单颗行星

// ═══════════════════════════════════════════════════════════════

function drawPlanet(s, x, y, dimmed) {

  const c = CONSTIT_COLORS[s.constellation];

  const isHovered   = (s.id === hoveredId);

  const isSelected  = (s.id === selectedId);

  const isCore      = (s.priority_level === 3 || s.magnitude === 5);

  // 为恒星节点注入个性化呼吸频率
  if (s._breathPhase === undefined) {
    s._breathPhase = Math.random() * Math.PI * 2;
    s._breathSpeed = 0.015 + Math.random() * 0.02;
  }
  const breathFactor = 0.72 + 0.28 * Math.sin(frame * s._breathSpeed + s._breathPhase);

  let baseAlpha = dimmed ? 0.18 : (s._brightness || 1.0);
  if (ceremonyActive && ceremonyScientist && s.id !== ceremonyScientist.id) {
    baseAlpha *= ceremonyFadeOpacity;
  } else {
    baseAlpha *= (dimmed ? 1.0 : breathFactor);
  }

  // 计算行星半径
  const r = planetRadius(s) * Math.min(1.0, (camera.zoom - 1.0) / 1.4);

  ctx.save();

  // 1. 微观对焦时才保留非常克制的外晕，概览星图保持清爽。
  if (camera.zoom >= 1.3 && r > 0) {
    const auraR = r * 1.5;
    const auraG = ctx.createRadialGradient(x, y, r * 0.8, x, y, auraR);
    const auraOpacity = dimmed ? 0.025 : 0.08 * (isSelected ? 1.3 : breathFactor);
    auraG.addColorStop(0, `hsla(${c.h}, ${c.s}%, ${c.l}%, ${auraOpacity})`);
    auraG.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraG;
    ctx.beginPath(); ctx.arc(x, y, auraR, 0, Math.PI * 2); ctx.fill();
  }

  ctx.globalAlpha = baseAlpha;

  // 1. 如果在宏观宇宙模式 (zoom < 1.3)，绘制极其微小的无纹理恒星彩点，形成星座

  if (camera.zoom < 1.3) {

    const starR = (isHovered || isSelected) ? 2.25 : ((s.magnitude >= 4 || isCore) ? 1.45 : 0.9);

    ctx.shadowColor = 'rgba(230, 238, 255, 0.52)';

    ctx.shadowBlur = (isHovered || isSelected) ? 5 : 1.1;

    ctx.fillStyle = (isHovered || isSelected) ? '#ffffff' : 'rgba(232, 238, 255, 0.62)';

    ctx.beginPath();

    ctx.arc(x, y, starR, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();

    return;

  }

  // 2. 否则在微观对焦模式，绘制带 3D 自转纹理与立体阴影的高清恒星球体

  // 随着 zoom 变大，星球半径平滑过渡

  drawSphericalPlanet2D(ctx, s, x, y, r, frame, {
    textureSize: 512,
    lightOpacity: dimmed ? 0.72 : 1,
    atmosphereOpacity: dimmed ? 0.35 : 0.9,
    rotationScale: 0.30,
  });

  // 选中外圈：极简干净的白圆圈，没有任何发光、投影与外晕特效

  if (isSelected && !dimmed) {

    ctx.strokeStyle = '#ffffff';

    ctx.lineWidth = 1.5;

    ctx.beginPath(); ctx.arc(x,y,r+3,0,Math.PI*2); ctx.stroke();

  }

  // 绘制星尘十字星芒 (Core/Active Nodes Astrophotography Flares)

  if (!dimmed && (isHovered || isSelected || (isCore && camera.zoom < 1.12))) {

    drawStarSpike(x, y, r, CONSTIT_COLORS[s.constellation], isHovered || isSelected);

  }

  ctx.restore();

}

function drawRing(x, y, r, c) {}

// ═══════════════════════════════════════════════════════════════

//  星尘衍射十字星芒 (High-Quality Astrophotography Spikes)

// ═══════════════════════════════════════════════════════════════

function drawStarSpike(x, y, r, colorObj, isActive) {

  ctx.save();

  // 呼吸脉动 Shimmer

  const shimmer = 0.85 + 0.15 * Math.sin(frame * 0.05 + (r * 10));

  const spikeLength = (isActive ? r * 3.6 : r * 2.15) * shimmer;

  const spikeWidth = isActive ? 0.8 : 0.45;

  // 1. 中心核心放射状柔光

  const grad = ctx.createRadialGradient(x, y, 0, x, y, r * (isActive ? 2.1 : 1.45));

  grad.addColorStop(0, 'rgba(255,255,255,0.9)');

  grad.addColorStop(0.24, 'rgba(225,235,255,0.36)');

  grad.addColorStop(0.58, 'rgba(196,214,255,0.08)');

  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;

  ctx.beginPath();

  ctx.arc(x, y, r * (isActive ? 2.1 : 1.45), 0, Math.PI * 2);

  ctx.fill();

  // 2. 水平极细十字线

  const hzGrad = ctx.createLinearGradient(x - spikeLength, y, x + spikeLength, y);

  hzGrad.addColorStop(0, 'rgba(255,255,255,0)');

  hzGrad.addColorStop(0.5, '#ffffff');

  hzGrad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.strokeStyle = hzGrad;

  ctx.lineWidth = spikeWidth;

  ctx.beginPath();

  ctx.moveTo(x - spikeLength, y);

  ctx.lineTo(x + spikeLength, y);

  ctx.stroke();

  // 3. 垂直极细十字线

  const vtGrad = ctx.createLinearGradient(x, y - spikeLength, x, y + spikeLength);

  vtGrad.addColorStop(0, 'rgba(255,255,255,0)');

  vtGrad.addColorStop(0.5, '#ffffff');

  vtGrad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.strokeStyle = vtGrad;

  ctx.lineWidth = spikeWidth;

  ctx.beginPath();

  ctx.moveTo(x, y - spikeLength);

  ctx.lineTo(x, y + spikeLength);

  ctx.stroke();

  ctx.restore();

}

// ═══════════════════════════════════════════════════════════════

//  星宿骨架连线绘制 (Razor-Thin Constellation Skeleton)

// ═══════════════════════════════════════════════════════════════

function drawSkeletalLinks() {

  ctx.save();

  const activeConstellation = camera.activeConstellation;

  const isAnyActive = (activeConstellation !== null);

  for (const link of skeletalLinks) {

    // 决定连线是否处于激活状态（对焦了其中某一位科学家的星宿）

    let isLinkActive = false;

    if (isAnyActive) {

      if (link.from.constellation === activeConstellation || link.to.constellation === activeConstellation) {

        isLinkActive = true;

      } else {

        // 隐藏非对焦星宿的连线

        continue;

      }

    }

    const activeId = selectedId || hoveredId;
    if (activeId) {
      isLinkActive = link.from.id === activeId || link.to.id === activeId;
    }

    let alpha = isLinkActive ? 0.42 : 0.105;

    alpha *= ceremonyFadeOpacity;

    if (alpha <= 0) continue;

    ctx.lineWidth = isLinkActive ? 0.95 : 0.58;

    // 对焦的星宿骨架加入发光阴影

    if (isLinkActive) {

      ctx.shadowColor = 'rgba(220, 232, 255, 0.42)';

      ctx.shadowBlur = 4;

    } else {

      ctx.shadowBlur = 0;

    }

    // 绘制从节点 A 到节点 B 的纯色发光星座连线，还原真实星空图谱 (Solid glowing constellation links)

    ctx.strokeStyle = `rgba(218, 228, 255, ${alpha})`;

    ctx.beginPath();

    ctx.moveTo(link.from._x, link.from._y);

    ctx.lineTo(link.to._x, link.to._y);

    ctx.stroke();

  }

  ctx.restore();

}

// ═══════════════════════════════════════════════════════════════

//  绘制星座连线 (Constellation Lines)
//  按轨道分组，同轨道内的科学家通过细白线连接成星座图案
//  风格：经典天文星座图，白色/淡色细线 + 星光闪烁

// ═══════════════════════════════════════════════════════════════

function drawConstellationLines() {
  return;
}

// ══════════════════════════════════════════════════════════════

//  绘制星星闪烁效果 (Star Glow Effect)
//  科学家行星上的星光闪烁，像真实星座中的星星

// ═══════════════════════════════════════════════════════════════

function drawStarGlow(s, r) {
  if (camera.zoom >= 1.3) return;

  const twinkle = 0.72 + Math.sin(frame * 0.045 + s._phaseX * 10) * 0.18;
  const glowSize = ((s.magnitude >= 4 || s.priority_level === 3) ? 7 : 4.6) * twinkle;

  const glow = ctx.createRadialGradient(s._x, s._y, 0, s._x, s._y, glowSize);
  glow.addColorStop(0, `rgba(255, 255, 255, ${0.11 * twinkle})`);
  glow.addColorStop(0.45, `rgba(206, 221, 255, ${0.032 * twinkle})`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(s._x, s._y, glowSize, 0, Math.PI * 2);
  ctx.fill();
}

function drawClickableHalo(s, x, y, dimmed) {
  if (dimmed || s.id !== hoveredId || camera.zoom >= 1.3) return;

  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.075);
  const radius = 13 + pulse * 2.5;

  ctx.save();
  ctx.strokeStyle = `rgba(230, 238, 255, ${0.34 + pulse * 0.14})`;
  ctx.lineWidth = 0.75;
  ctx.shadowColor = 'rgba(220, 232, 255, 0.26)';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(230, 238, 255, ${0.18 + pulse * 0.08})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - radius - 5, y);
  ctx.lineTo(x - radius + 2, y);
  ctx.moveTo(x + radius - 2, y);
  ctx.lineTo(x + radius + 5, y);
  ctx.moveTo(x, y - radius - 5);
  ctx.lineTo(x, y - radius + 2);
  ctx.moveTo(x, y + radius - 2);
  ctx.lineTo(x, y + radius + 5);
  ctx.stroke();
  ctx.restore();
}

function drawHUDScanningRing(s, x, y) {
  const isHovered = (s.id === hoveredId);
  const isSelected = (s.id === selectedId);
  if (!isHovered && !isSelected) return;

  const r = planetRadius(s) * Math.min(1.0, (camera.zoom - 1.0) / 1.4);
  if (camera.zoom < 1.3 || r <= 0) return;

  ctx.save();
  const c = CONSTIT_COLORS[s.constellation];
  const themeColor = `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.85)`;
  const hudR = r * 1.85;

  ctx.strokeStyle = themeColor;
  ctx.shadowColor = `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.4)`;
  ctx.shadowBlur = 6;

  // 1. Rotating dashed outer ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, hudR, 0, Math.PI * 2);
  ctx.lineWidth = 0.8;
  ctx.setLineDash([4, 6]);
  ctx.translate(x, y);
  ctx.rotate(frame * 0.012);
  ctx.translate(-x, -y);
  ctx.stroke();
  ctx.restore();

  // 2. Ticked inner ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, hudR - 3, 0, Math.PI * 2);
  ctx.lineWidth = 0.6;
  ctx.setLineDash([1, 8]);
  ctx.translate(x, y);
  ctx.rotate(-frame * 0.008);
  ctx.translate(-x, -y);
  ctx.stroke();
  ctx.restore();

  // 3. Technical corner ticks
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1.0;
  const bracketSize = Math.max(3, r * 0.25);
  const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  for (let angle of angles) {
    const bx = x + Math.cos(angle + frame * 0.005) * (hudR + 4);
    const by = y + Math.sin(angle + frame * 0.005) * (hudR + 4);
    ctx.moveTo(bx - bracketSize, by);
    ctx.lineTo(bx + bracketSize, by);
    ctx.moveTo(bx, by - bracketSize);
    ctx.lineTo(bx, by + bracketSize);
  }
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawScreenSpaceHUD() {
  if (camera.zoom < 1.3 && !hoveredId && !selectedId) return;

  ctx.save();

  // 1. Viewport corner brackets
  const pad = 15;
  const len = 20;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(pad, pad + len);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + len, pad);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(W - pad, pad + len);
  ctx.lineTo(W - pad, pad);
  ctx.lineTo(W - pad - len, pad);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(pad, H - pad - len);
  ctx.lineTo(pad, H - pad);
  ctx.lineTo(pad + len, H - pad);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(W - pad, H - pad - len);
  ctx.lineTo(W - pad, H - pad);
  ctx.lineTo(W - pad - len, H - pad);
  ctx.stroke();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════

//  绘制星座中心浮动标题

// ═══════════════════════════════════════════════════════════════

function drawConstellationLabels() {

  const labelAlpha = 1.0 - Math.min(1.0, (camera.zoom - 1.0) / 0.5);

  if (labelAlpha <= 0.01) return;

  ctx.save();

  ctx.globalAlpha = labelAlpha;

  constellationLabelBounds = {};

  for (let constellation = 1; constellation <= 5; constellation++) {

    const center = CONSTELLATION_CENTERS[constellation];

    // 标题放置在星座中心略偏下方，避免压住核心恒星

    const targetX = center.x * W * 0.45;

    const targetY = center.y * H * 0.45 + 130 * SC;

    const x = CX + (targetX - camera.x) * camera.zoom;

    const y = CY + (targetY - camera.y) * camera.zoom;

    const info = CONSTELLATION_NAMES[constellation];

    const color = CONSTIT_COLORS[constellation];

    const isHovered = (hoveredConstellation === constellation);

    ctx.save();

    // 测量文字宽度

    const txt = info.icon;

    ctx.font = `bold ${12 * SC}px 'Space Grotesk', 'Noto Sans SC', sans-serif`;

    const txtWidth = ctx.measureText(txt).width;

    const padX = 14 * SC;

    const padY = 7 * SC;

    const rectW = txtWidth + padX * 2;

    const rectH = 14 * SC + padY * 2;

    const rx = x - rectW / 2;

    const ry = y - rectH / 2;

    // 渲染毛玻璃胶囊框

    ctx.fillStyle = isHovered ? 'rgba(12, 18, 38, 0.92)' : 'rgba(6, 10, 24, 0.72)';

    ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${isHovered ? 0.90 : 0.4})`;

    ctx.lineWidth = isHovered ? 1.5 : 1.0;

    ctx.shadowColor = `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.35)`;

    ctx.shadowBlur = isHovered ? 10 : 5;

    ctx.beginPath();

    ctx.roundRect(rx, ry, rectW, rectH, 16 * SC);

    ctx.fill();

    ctx.stroke();

    // 绘制文字

    ctx.shadowBlur = 0;

    ctx.fillStyle = isHovered ? '#ffffff' : `hsla(${color.h}, ${color.s}%, 92%, 0.90)`;

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText(txt, x, y);

    ctx.restore();

    // 缓存标签包围盒以进行碰撞检测

    constellationLabelBounds[constellation] = { x: rx, y: ry, w: rectW, h: rectH };

  }

  ctx.restore();

}

function drawConnections() {}

function drawConstellations() {}

// ── 平滑相机插值：更快、更稳的聚焦/复原 ──
function smoothCameraLerp() {
  const t = 0.12;                  // 原 0.075，提升响应速度
  const snap = 0.002;              // 接近目标时硬 snap，避免无限微动
  camera.zoom += (camera.targetZoom - camera.zoom) * t;
  camera.x += (camera.targetX - camera.x) * t;
  camera.y += (camera.targetY - camera.y) * t;
  if (Math.abs(camera.zoom - camera.targetZoom) < snap) camera.zoom = camera.targetZoom;
  if (Math.abs(camera.x - camera.targetX) < snap) camera.x = camera.targetX;
  if (Math.abs(camera.y - camera.targetY) < snap) camera.y = camera.targetY;
}

let planetPositions = []; // [{s, x, y, r}]

function render() {

  // 海报打开期间，主画布被遮罩盖住，仅推进 frame 与相机 LERP，跳过重绘避免与海报 RAF 双层竞争
  if (selectedId && posterAnimationId) {
    frame++;
    smoothCameraLerp();
    requestAnimationFrame(render);
    return;
  }

  ctx.clearRect(0, 0, W, H);

  drawBackground();

  drawGrid(); // 绘制隐约的测绘经纬度同心圆网格

  drawStars();

  if (ceremonyActive) {
    ceremonyFadeOpacity = Math.max(0.0, ceremonyFadeOpacity - 0.04);
  } else {
    ceremonyFadeOpacity = Math.min(1.0, ceremonyFadeOpacity + 0.04);
  }

  // 1. 平滑插值相机位置 (Smoothstep LERP Camera)

  smoothCameraLerp();

  // 相机是否处于大幅运动中（用于降频高消耗绘制）

  const isCameraMoving = Math.abs(camera.zoom - camera.targetZoom) > 0.01 ||
                         Math.abs(camera.x - camera.targetX) > 1 ||
                         Math.abs(camera.y - camera.targetY) > 1;

  // 2. 绘制星系背景核心 (已删除)

  // drawGalaxyCore();

  // 3. 计算所有行星的当前帧 screen 坐标并按景深排序

  planetPositions = [];

  const activeId = selectedId || hoveredId;

  const toRender = scientists.map(s => {

    const center = s._layoutCenter || CONSTELLATION_CENTERS[s.constellation] || { x: 0, y: 0 };

    // 在场景空间：将教材星座分布在星空四角及中央

    const sceneX = center.x * W * 0.45 + s._relX * SC;

    const sceneY = center.y * H * 0.45 + s._relY * SC;

    // 缓和的小浮动（相机大幅运动时降低精度，避免缩放/复原动画卡顿）

    const floatAmp = isCameraMoving ? 8 * SC : 14 * SC;

    const dx = Math.sin(frame * 0.006 + s._phaseX) * floatAmp;

    const dy = Math.cos(frame * 0.008 + s._phaseY) * floatAmp;

    const px = CX + (sceneX + dx - camera.x) * camera.zoom;

    const py = CY + (sceneY + dy - camera.y) * camera.zoom;

    s._x = px;

    s._y = py;

    return { s, x: px, y: py };

  }).sort((a, b) => a.y - b.y);

  // 4. 相机大幅运动时降低骨架连线绘制频率（每 2 帧一次），把 CPU 让给缩放动画

  if (!isCameraMoving || frame % 2 === 0) {

    drawSkeletalLinks();

  }

  // 5. 绘制所有恒星

  for (const item of toRender) {

    const { s, x, y } = item;

    const vis = isVisible(s);

    const matched = matchSearch(s);

    const inFilter = vis && matched;

    let dimmed = false;

    let brightness = 1.0;

    if (!inFilter) {

      dimmed = true;

      brightness = 0.08;

    } else if (camera.activeConstellation !== null) {

      // 聚焦模式下，只显示当前教材对应的星座，其他星座星体逐渐淡出隐匿

      if (s.constellation === camera.activeConstellation) {

        if (activeId) {

          const isActive = s.id === activeId;

          const isConnected = s._connections && s._connections.has(activeId);

          if (isActive || isConnected) {

            dimmed = false;

            brightness = 1.0;

          } else {

            dimmed = true;

            brightness = 0.18;

          }

        } else {

          dimmed = false;

          brightness = 1.0;

        }

      } else {

        dimmed = true;

        brightness = 0.02; // 极弱背景星 speck

      }

    } else if (activeId) {

      const isActive = s.id === activeId;

      const isConnected = s._connections && s._connections.has(activeId);

      if (isActive || isConnected) {

        dimmed = false;

        brightness = 1.0;

      } else {

        dimmed = true;

        brightness = 0.18;

      }

    }

    s._brightness = brightness;

    // 绘制星星外发光（星座效果）
    const r = planetRadius(s);
    drawStarGlow(s, r);

    drawPlanet(s, x, y, dimmed);
    drawClickableHalo(s, x, y, dimmed);
    drawHUDScanningRing(s, x, y);

    // 仅可见并且在当前聚焦状态下的计入点击检测 (Overview Mode 大家都计入，Focused Mode 只计入当前星座)

    if (vis) {

      const isSelectable = (camera.activeConstellation === null || s.constellation === camera.activeConstellation);

      if (isSelectable) {

        // 点击热区：overview 下用动态最小热区（避免小星点难点），聚焦时用实际半径

        const baseR = planetRadius(s);

        const hitR = camera.zoom < 1.3 ? Math.max(baseR, 10 * SC) : baseR;

        planetPositions.push({ s, x, y, r: hitR });

      }

    }

  }

  // 7. 绘制星座连线 (Constellation Lines)

  drawConstellationLines();

  // 8. 暗角

  const tF=ctx.createLinearGradient(0,0,0,H*0.08);

  tF.addColorStop(0,'rgba(0,0,0,0.7)');tF.addColorStop(1,'rgba(0,0,0,0)');

  ctx.fillStyle=tF;ctx.fillRect(0,0,W,H*0.08);

  const bF=ctx.createLinearGradient(0,H*0.88,0,H);

  bF.addColorStop(0,'rgba(0,0,0,0)');bF.addColorStop(1,'rgba(0,0,0,0.9)');

  ctx.fillStyle=bF;ctx.fillRect(0,H*0.88,W,H*0.12);

  // 绘制动态测绘十字交叉线与天文坐标提示 (Sci-Fi Coordinates Overlay)
  if (isMouseOnCanvas && mouseX > -1000 && mouseY > -1000 && !selectedId) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    
    ctx.beginPath();
    ctx.moveTo(mouseX, 0); ctx.lineTo(mouseX, H);
    ctx.moveTo(0, mouseY); ctx.lineTo(W, mouseY);
    ctx.stroke();
    
    ctx.restore();
  }

  // Draw cybernetic scanning lines and corner frames
  drawScreenSpaceHUD();

  // Update HTML telemetry panel dynamically
  if (frame % 8 === 0) {
    const timeEl = document.getElementById('hud-time');
    if (timeEl) {
      const now = new Date();
      const ms = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}:${ms}`;
      timeEl.textContent = timeStr;
    }
    
    const coordsEl = document.getElementById('hud-radar-coords');
    if (coordsEl) {
      if (hoveredId || selectedId) {
        const activeSci = scientistMap[hoveredId || selectedId];
        const center = CONSTELLATION_CENTERS[activeSci.constellation] || { x: 0, y: 0 };
        const activeCenter = activeSci._layoutCenter || center;
        const sceneX = activeCenter.x * W * 0.45 + activeSci._relX * SC;
        const sceneY = activeCenter.y * H * 0.45 + activeSci._relY * SC;
        const ra = ((12 + sceneX * 0.005) % 24).toFixed(3);
        const dec = (sceneY * 0.01).toFixed(3);
        coordsEl.textContent = `RA:${ra}h // DEC:${dec}°`;
      } else {
        coordsEl.textContent = `-- // --`;
      }
    }

    const noiseEl = document.getElementById('hud-noise');
    if (noiseEl) {
      const noise = (0.018 + Math.random() * 0.006).toFixed(4);
      noiseEl.textContent = `${noise} dB`;
    }

    const statusEl = document.getElementById('hud-status');
    if (statusEl) {
      if (selectedId) {
        statusEl.textContent = 'TRGT_LOCK // STEADY';
        statusEl.className = 'hud-val text-green';
      } else if (hoveredId) {
        statusEl.textContent = 'TRGT_SCAN // INDEXING';
        statusEl.className = 'hud-val';
      } else {
        statusEl.textContent = 'SYS_ACTIVE // SEARCHING';
        statusEl.className = 'hud-val';
      }
    }
  }

  frame++;

  requestAnimationFrame(render);

}

// ═══════════════════════════════════════════════════════════════

//  Hit Testing

// ═══════════════════════════════════════════════════════════════

function hitTest(mx, my) {

  let nearest = null;
  let nearestD2 = Infinity;

  for (let i = planetPositions.length - 1; i >= 0; i--) {

    const {s, x, y, r} = planetPositions[i];

    const hitR = Math.max(r + 4, camera.zoom < 1.3 ? 26 : 18);

    const dx = mx - x, dy = my - y;

    const d2 = dx*dx + dy*dy;

    if (d2 <= hitR*hitR && d2 < nearestD2) {

      nearest = s;

      nearestD2 = d2;

    }

  }

  return nearest;

}

// ═══════════════════════════════════════════════════════════════

//  鼠标事件

// ═══════════════════════════════════════════════════════════════

const tooltip = document.getElementById('tooltip');

const ttName  = document.getElementById('tt-name');

const ttRecall= document.getElementById('tt-recall');

cv.addEventListener('mousemove', e => {

  const rect = cv.getBoundingClientRect();

  const mx = e.clientX - rect.left;

  const my = e.clientY - rect.top;

  mouseX = mx;

  mouseY = my;

  isMouseOnCanvas = true;

  // 1. 优先检测教材星座标签悬停

  hoveredConstellation = null;

  if (camera.zoom < 1.3) {

    for (let constellation = 1; constellation <= 5; constellation++) {

      const bounds = constellationLabelBounds[constellation];

      if (bounds && mx >= bounds.x && mx <= bounds.x + bounds.w && my >= bounds.y && my <= bounds.y + bounds.h) {

        hoveredConstellation = constellation;

        cv.style.cursor = 'pointer';

        hoveredId = null;

        lastHoveredId = null;

        tooltip.classList.remove('show');

        return;

      }

    }

  }

  // 2. 检测恒星悬停

  const hit = hitTest(mx, my);

  if (hit) {

    cv.style.cursor = 'pointer';

    hoveredId = hit.id;

    if (!selectedId) updateMissionDossier(hit, 'preview');

    // Play sound and trigger typewriter only when a new star is hovered

    if (hit.id !== lastHoveredId) {

      lastHoveredId = hit.id;

      // Play sound ping based on constellation harmonic chord

      const freqMap = { 1: 329.63, 2: 392.00, 3: 440.00, 4: 523.25, 5: 587.33 };

      const baseFreq = freqMap[hit.constellation] || 440;

      const isCore = (hit.priority_level === 3 || hit.magnitude === 5);

      playPing(isCore ? baseFreq * 2.0 : baseFreq, 'triangle', isCore ? 0.6 : 0.35, isCore ? 0.08 : 0.05);

      // Typewriter effect

      typewriterText = hit.quick_recall || '';

      typewriterIndex = 0;

      ttRecall.textContent = '';

      if (typewriterInterval) clearInterval(typewriterInterval);

      typewriterInterval = setInterval(() => {

        if (typewriterIndex < typewriterText.length) {

          ttRecall.textContent += typewriterText.charAt(typewriterIndex);

          typewriterIndex++;

        } else {

          clearInterval(typewriterInterval);

        }

      }, 15);

      // Update custom telemetry values

      const center = CONSTELLATION_CENTERS[hit.constellation] || { x: 0, y: 0 };

      const hitCenter = hit._layoutCenter || center;
      const sceneX = hitCenter.x * W * 0.45 + hit._relX * SC;

      const sceneY = hitCenter.y * H * 0.45 + hit._relY * SC;

      const ra = ((12 + sceneX * 0.005) % 24).toFixed(2);

      const dec = (sceneY * 0.01).toFixed(2);

      document.getElementById('tt-sector').textContent = `SECTOR: 0${hit.constellation}`;

      document.getElementById('tt-coords').textContent = `RA:${ra}h / DEC:${dec}°`;

      // Dynamically set CSS variable for theme borders

      const constellationColor = CONSTIT_COLORS[hit.constellation];

      tooltip.style.setProperty('--hover-color', constellationColor.hex);

      tooltip.style.borderColor = constellationColor.hex;

      tooltip.style.boxShadow = `0 0 15px hsla(${constellationColor.h}, ${constellationColor.s}%, ${constellationColor.l}%, 0.18)`;

    }

    ttName.textContent = hit._cnName;

    const tx = e.clientX + 16;

    const ty = e.clientY - 10;

    tooltip.style.left = Math.min(tx, window.innerWidth - 270) + 'px';

    tooltip.style.top  = Math.max(10, ty) + 'px';

    tooltip.classList.add('show');

  } else {

    cv.style.cursor = 'default';

    hoveredId = null;

    lastHoveredId = null;

    if (!selectedId) updateMissionDossier(null);

    tooltip.classList.remove('show');

    if (typewriterInterval) {

      clearInterval(typewriterInterval);

      typewriterInterval = null;

    }

  }

});

cv.addEventListener('mouseleave', () => {

  hoveredId = null;

  lastHoveredId = null;

  hoveredConstellation = null;

  isMouseOnCanvas = false;

  mouseX = -9999;

  mouseY = -9999;

  tooltip.classList.remove('show');

  if (!selectedId) updateMissionDossier(null);

  if (typewriterInterval) {

    clearInterval(typewriterInterval);

    typewriterInterval = null;

  }

});

cv.addEventListener('click', e => {

  const rect = cv.getBoundingClientRect();

  const mx = e.clientX - rect.left;

  const my = e.clientY - rect.top;

  // 1. 优先检测星座标题点击以进行缩放

  if (camera.zoom < 1.3 && hoveredConstellation !== null) {

    focusConstellation(hoveredConstellation);

    return;

  }

  // 2. 检测恒星点击

  const hit = hitTest(mx, my);

  if (hit) {

    // 直接弹出卡片：跳过星座聚焦、相机 LERP、星球飞入等动画
    instantSelectScientist(hit);

  } else {

    // 点击空白处：如果是 Focused Mode，返回 Overview，否则取消选中

    if (camera.activeConstellation !== null) {

      resetFocus();

    } else {

      deselectScientist();

    }

  }

});

// ═══════════════════════════════════════════════════════════════

//  选中 & 详情面板

// ═══════════════════════════════════════════════════════════════

let posterAnimationId = null;

let posterFrame = 0;

let planetTransferAnimation = null;

function startZoomCeremony(s, origin = null) {
  ceremonyActive = true;
  ceremonyScientist = s;
  ceremonyFadeOpacity = 1.0;
  isCardOpening = true;

  // 场景中心位置映射
  const center = s._layoutCenter || CONSTELLATION_CENTERS[s.constellation] || { x: 0, y: 0 };
  const sceneX = center.x * W * 0.45 + s._relX * SC;
  const sceneY = center.y * H * 0.45 + s._relY * SC;

  // Keep the star field moving toward the selected node while the card opens.
  camera.targetX = sceneX;
  camera.targetY = sceneY;
  camera.targetZoom = 2.85;

  const launchOrigin = origin || {
    x: (cv.getBoundingClientRect().left || 0) + (s._x || CX),
    y: (cv.getBoundingClientRect().top || 0) + (s._y || CY),
  };

  setTimeout(() => {
    if (ceremonyActive && ceremonyScientist === s) {
      runPlanetTransfer(s, launchOrigin);
    }
  }, 180);
}

function instantSelectScientist(s) {
  // 直接聚焦并弹出卡片：关闭所有动画，瞬间定位相机并显示海报
  const center = s._layoutCenter || CONSTELLATION_CENTERS[s.constellation] || { x: 0, y: 0 };
  const sceneX = center.x * W * 0.45 + s._relX * SC;
  const sceneY = center.y * H * 0.45 + s._relY * SC;

  camera.x = sceneX;
  camera.y = sceneY;
  camera.zoom = 2.85;
  camera.targetX = sceneX;
  camera.targetY = sceneY;
  camera.targetZoom = 2.85;
  camera.activeConstellation = s.constellation;

  filterConstellation = s.constellation;
  document.querySelectorAll('.const-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.constellation) === s.constellation);
  });
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.classList.add('show');
  updateCount();

  selectScientist(s, { animatedOpen: false });
}

function selectScientist(s, options = {}) {

  selectedId = s.id;

  updateMissionDossier(s, 'locked');

  buildConnectionLines(s);

  showPoster(s, options);

}

function deselectScientist() {

  selectedId = null;

  updateMissionDossier(null);

  connectionLines = [];

  ceremonyActive = false;

  cancelPlanetTransfer();

  camera.activeConstellation = null;
  camera.targetX = 0;
  camera.targetY = 0;
  camera.targetZoom = 1.0;
  
  // Directly jump back to prevent lingering on the big planet
  camera.x = 0;
  camera.y = 0;
  camera.zoom = 1.0;

  const overlay = document.getElementById('poster-overlay');

  overlay.classList.remove('open', 'animating-transfer');

  // Delay display none to allow fade out transition

  setTimeout(() => {

    if (!selectedId) {

      // 用 visibility 隐藏而非 display:none，保留子元素 layout 供 runPlanetTransfer 测量 BoundingRect
      overlay.style.visibility = 'hidden';
      overlay.classList.remove('poster-loading');

      if (posterAnimationId) {

        cancelAnimationFrame(posterAnimationId);

        posterAnimationId = null;

      }

    }

  }, 350);

}

function buildConnectionLines(s) {

  // 根据用户要求，完全关闭科学家之间的任何关系连线

  connectionLines = [];

}

let posterThree = null;

function initPosterThree(pcv, s) {
  if (posterThree && posterThree.canvas === pcv) {
    updatePosterThree(s);
    return;
  }
  if (posterThree) {
    try {
      posterThree.renderer.dispose();
    } catch(e) {}
  }
  
  const w = pcv.width;
  const h = pcv.height;
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera.position.z = 11.5;
  
  const renderer = new THREE.WebGLRenderer({ canvas: pcv, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  
  const ambientLight = new THREE.AmbientLight(0x111122, 0.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
  rimLight.position.set(-5, -2, -3);
  scene.add(rimLight);

  const geometry = new THREE.SphereGeometry(4.0, 64, 64);
  
  const visual = getScientistVisual(s);
  const textureSource = getPlanetTextureSource(s);
  const texture = textureSource.source instanceof HTMLCanvasElement
    ? new THREE.CanvasTexture(textureSource.source)
    : new THREE.Texture(textureSource.source);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    color: new THREE.Color(0xffffff),
    roughness: 0.75,
    metalness: 0.05
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const atmosphereGeometry = new THREE.SphereGeometry(4.15, 32, 32);
  const atmosphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  posterThree = {
    canvas: pcv,
    renderer,
    scene,
    camera,
    mesh,
    atmosphere,
    atmosphereMaterial,
    material,
    currentId: s.id
  };
}

function updatePosterThree(s) {
  if (!posterThree) return;
  if (posterThree.currentId === s.id) return;
  
  posterThree.currentId = s.id;
  
  const visual = getScientistVisual(s);
  const textureSource = getPlanetTextureSource(s);
  const texture = textureSource.source instanceof HTMLCanvasElement
    ? new THREE.CanvasTexture(textureSource.source)
    : new THREE.Texture(textureSource.source);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  posterThree.material.map = texture;
  posterThree.material.color.set(0xffffff);
  posterThree.material.needsUpdate = true;
  if (posterThree.atmosphereMaterial) {
    posterThree.atmosphereMaterial.color.set(0x4488ff);
    posterThree.atmosphereMaterial.opacity = 0.12;
    posterThree.atmosphereMaterial.needsUpdate = true;
  }
}

function renderPosterThreeFrame() {
  if (!posterThree) return;
  posterThree.mesh.rotation.y += 0.005;
  if (posterThree.atmosphere) {
    posterThree.atmosphere.rotation.copy(posterThree.mesh.rotation);
  }
  posterThree.renderer.render(posterThree.scene, posterThree.camera);
}

function drawHUDOverlay(hudcv, s) {
  const pctx = hudcv.getContext('2d');
  const w = hudcv.width;
  const h = hudcv.height;
  pctx.clearRect(0, 0, w, h);
  
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 35;
  
  pctx.save();
  
  // 1. 轨道专属主题色柔和大气的边缘晕光 (Atmospheric Aura)
  const c = CONSTIT_COLORS[s.constellation];
  const auraG = pctx.createRadialGradient(cx, cy, r - 6, cx, cy, r + 26);
  auraG.addColorStop(0, `hsla(${c.h},${c.s}%,${c.l}%,0.42)`);
  auraG.addColorStop(0.25, `hsla(${c.h},${c.s}%,${c.l}%,0.18)`);
  auraG.addColorStop(1, 'rgba(0,0,0,0)');
  
  pctx.fillStyle = auraG;
  pctx.beginPath();
  pctx.arc(cx, cy, r + 26, 0, Math.PI * 2);
  pctx.fill();
  
  pctx.restore();
  
  // 2. 绘制行星外侧的圆轨道线 (Constellation line)
  pctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  pctx.lineWidth = 0.8;
  pctx.beginPath();
  pctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
  pctx.stroke();
  
  // 绘制 4 个小圆圈指示点
  const angles = [Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.75, Math.PI * 0.25];
  pctx.fillStyle = '#ffffff';
  pctx.strokeStyle = '#ffffff';
  for (const angle of angles) {
    const dx = cx + Math.cos(angle) * (r + 16);
    const dy = cy + Math.sin(angle) * (r + 16);
    
    pctx.beginPath();
    pctx.arc(dx, dy, 2, 0, Math.PI * 2);
    pctx.fill();
    
    pctx.beginPath();
    pctx.arc(dx, dy, 4, 0, Math.PI * 2);
    pctx.lineWidth = 0.6;
    pctx.stroke();
  }
}

function draw2DPlanetFallback(pcv, s) {
  const pctx = pcv.getContext('2d');
  const w = pcv.width;
  const h = pcv.height;
  pctx.clearRect(0, 0, w, h);
  
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 35;
  
  // HUD canvas must stay informational only. The real planet surface is rendered
  // by Three.js; drawing texture or shadow here creates a muddy double layer.
}

function renderSidebarPlanets(frame) {
  const canvases = document.querySelectorAll('.sidebar-node-canvas');
  canvases.forEach(cv => {
    const id = cv.dataset.id;
    const s = scientistMap[id];
    if (!s) return;
    const ctx = cv.getContext('2d');
    const w = cv.width;
    const h = cv.height;
    ctx.clearRect(0, 0, w, h);
    
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 2;
    
    drawSphericalPlanet2D(ctx, s, cx, cy, r, frame, {
      textureSize: 256,
      lightOpacity: 1.12,
      atmosphereOpacity: 0.85,
      rotationScale: 1.35,
    });
  });
}

function renderPosterPlanet(s) {
  const pcv = document.getElementById('poster-canvas');
  if (!pcv) return;

  if (typeof THREE !== 'undefined') {
    initPosterThree(pcv, s);
    renderPosterThreeFrame();
    // 首帧渲染完成后移除 loading（posterThree 此时已初始化）
    if (posterFrame === 0) {
      const overlay = document.getElementById('poster-overlay');
      if (overlay && overlay.classList.contains('poster-loading')) {
        overlay.classList.remove('poster-loading');
      }
    }
  } else {
    draw2DPlanetFallback(pcv, s);
  }

  renderSidebarPlanets(posterFrame);

  posterFrame++;
  posterAnimationId = requestAnimationFrame(() => renderPosterPlanet(s));
}

const CONSTIT_CENTER_ICONS = {

  1: '🔬',

  2: '🧬',

  3: '🌿',

  4: '🦊',

  5: '🧪'

};

function drawMiniConstellation(constellationNum) {

  const ocv = document.getElementById('mini-constellation-canvas');

  if (!ocv) return;

  const octx = ocv.getContext('2d');

  // High-DPI support

  const dpr = window.devicePixelRatio || 1;

  ocv.width = 100 * dpr;

  ocv.height = 100 * dpr;

  octx.scale(dpr, dpr);

  octx.clearRect(0, 0, 100, 100);

  const cx = 50, cy = 50;

  // 1. Draw central star (sun)

  octx.fillStyle = '#ffffff';

  octx.beginPath();

  octx.arc(cx, cy, 3, 0, Math.PI * 2);

  octx.fill();

  // 2. Draw concentric rings

  const themeColor = CONSTIT_COLORS[constellationNum].hex;

  for (let i = 1; i <= 5; i++) {

    const radius = 10 + i * 7.5;

    octx.strokeStyle = (i === constellationNum) ? themeColor : 'rgba(255,255,255,0.08)';

    octx.lineWidth = (i === constellationNum) ? 1.2 : 0.6;

    octx.beginPath();

    octx.arc(cx, cy, radius, 0, Math.PI * 2);

    octx.stroke();

    const angle = i * 0.8 + 1.2;

    const dotX = cx + Math.cos(angle) * radius;

    const dotY = cy + Math.sin(angle) * radius;

    if (i === constellationNum) {

      octx.fillStyle = themeColor;

      octx.shadowColor = themeColor;

      octx.shadowBlur = 6;

      octx.beginPath();

      octx.arc(dotX, dotY, 3.0, 0, Math.PI * 2);

      octx.fill();

      octx.shadowBlur = 0;

    } else {

      octx.fillStyle = 'rgba(255,255,255,0.18)';

      octx.beginPath();

      octx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);

      octx.fill();

    }

  }

}

function cancelPlanetTransfer() {
  if (planetTransferAnimation) {
    try {
      if (typeof planetTransferAnimation.kill === 'function') {
        planetTransferAnimation.kill();
      } else if (typeof planetTransferAnimation.cancel === 'function') {
        planetTransferAnimation.cancel();
      }
    } catch (e) {}
    planetTransferAnimation = null;
  }

  document.getElementById('poster-overlay')?.classList.remove('animating-transfer');
  document.querySelectorAll('.stellar-transfer-dot').forEach(dot => dot.remove());
}

function runPlanetTransfer(s, origin) {
  cancelPlanetTransfer();

  if (prefersReducedMotion()) {
    selectScientist(s, { origin, animatedOpen: true });
    return;
  }

  const dot = document.createElement('div');
  dot.className = 'stellar-transfer-dot';
  dot.style.cssText = `
    position: fixed;
    left: ${origin.x}px;
    top: ${origin.y}px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 12px 4px rgba(150, 200, 255, 0.9);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(dot);

  const overlay = document.getElementById('poster-overlay');
  const targetEl = document.querySelector('.poster-planet-container');
  let targetRect = null;

  // overlay 改用 visibility 隐藏后，子元素 layout 始终存在，直接测量即可（无需临时切换 display）
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetRect = rect;
    }
  }

  if (!targetRect) {
    dot.remove();
    selectScientist(s, { origin, animatedOpen: true });
    return;
  }

  planetTransferAnimation = gsap.to(dot, {
    left: targetRect.left + targetRect.width / 2,
    top: targetRect.top + targetRect.height / 2,
    width: targetRect.width * 0.6,
    height: targetRect.width * 0.6,
    autoAlpha: 0,
    duration: 0.6,
    ease: 'power3.inOut',
    onComplete: () => {
      planetTransferAnimation = null;
      dot.remove();

      if (ceremonyActive && ceremonyScientist === s) {
        selectScientist(s, { origin, animatedOpen: true });
      } else {
        isCardOpening = false;
      }
    },
  });
}

function showPoster(s, options = {}) {

  const overlay = document.getElementById('poster-overlay');

  const body = document.getElementById('poster-info-body');

  const c = CONSTIT_COLORS[s.constellation];

  const constellationColor = `hsl(${c.h},${c.s}%,${c.l}%)`;

  const constellationColorGlow = `hsla(${c.h},${c.s}%,${c.l}%,0.3)`;

  // 设置 CSS 变量，使卡片边框及发光与科学家对应轨道颜色一致

  overlay.style.setProperty('--constellation-color', constellationColor);

  overlay.style.setProperty('--constellation-glow', constellationColorGlow);

  // 提取英文名：优先匹配括号内，其次匹配任意连续英文片段，都没有则留空

  let enName = '';

  const bracketMatch = s.name.match(/[（(]\s*([A-Za-z\s&._\-–—,]+?)\s*[）)]/);

  if (bracketMatch && bracketMatch[1]) {

    enName = bracketMatch[1].trim();

  } else {

    const anyEnMatch = s.name.match(/[A-Za-z][A-Za-z\s&._\-–—,]+/);

    if (anyEnMatch) {

      enName = anyEnMatch[0].trim();

    }

  }

  document.getElementById('poster-name-en').textContent = enName.toUpperCase();

  const cnNameEl = document.getElementById('poster-name-cn');
  const cnName = s._cnName || s.name || s.id;
  const cnNameLength = Array.from(cnName).length;
  const nameSize = cnNameLength >= 9 ? 34 : cnNameLength >= 7 ? 40 : 48;
  cnNameEl.textContent = cnName;
  cnNameEl.style.setProperty('font-size', `${nameSize}px`, 'important');

  // 4角元数据设置

  document.getElementById('meta-era').textContent = s.era || "未知时代";

  document.getElementById('meta-nationality').textContent = s.nationality || "未知国籍";

  document.getElementById('meta-priority').textContent = s.priority || "常规考点";

  document.getElementById('meta-sector').textContent = CONSTIT_LABELS[s.constellation];

  // 表格参数计算与填充

  document.getElementById('table-center-icon').textContent = CONSTIT_CENTER_ICONS[s.constellation] || '🧬';

  document.getElementById('val-magnitude').textContent = `${s.magnitude} / 5`;

  document.getElementById('val-stars').textContent = '★'.repeat(s.magnitude) + '☆'.repeat(5 - s.magnitude);

  const cogType = s.cognitive_type || "实验观察/实证分析";

  const cogParts = cogType.split('/');

  document.getElementById('val-cognitive-cn').textContent = cogParts[0] || "实验观察";

  document.getElementById('val-cognitive-en').textContent = cogParts[1] || "实证分析";

  document.getElementById('val-module').textContent = s.knowledge_module || "经典发现";

  document.getElementById('val-books').textContent = CONSTIT_LABELS[s.constellation].split(' · ')[0];

  // 渲染主体文字描述：直接展示高考考点、快速记忆、核心方法
  body.innerHTML = `

    ${s.focus.length ? `
    <div class="p-section">
      <h4>📌 高考考点</h4>
      <div class="p-tags">
        ${s.focus.map(f => {
          const hasMethod = findMethod(f);
          if (hasMethod) {
            return `<span class="p-tag focus clickable-method-tag" data-method="${f}">${f}</span>`;
          }
          return `<span class="p-tag focus">${f}</span>`;
        }).join('')}
      </div>
    </div>` : ''}

    ${s.quick_recall ? `
    <div class="p-section">
      <h4>⚡ 快速记忆</h4>
      <div class="p-recall-hero">${s.quick_recall}</div>
    </div>` : ''}

    ${s.core_method.length ? `
    <div class="p-section">
      <h4>🔬 核心方法</h4>
      <div class="p-tags">
        ${s.core_method.map(m => {
          const hasMethod = findMethod(m);
          if (hasMethod) {
            return `<span class="p-tag clickable-method-tag" data-method="${m}">${m}</span>`;
          }
          return `<span class="p-tag">${m}</span>`;
        }).join('')}
      </div>
    </div>` : ''}

  `;

  // 绑定科学方法点击事件
  body.querySelectorAll('.clickable-method-tag').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const mName = el.dataset.method;
      const matchedMethod = findMethod(mName);
      if (matchedMethod) {
        showMethodDetail(matchedMethod);
      }
    });
  });

  // 打开海报模态框

  overlay.style.visibility = 'visible';
  overlay.style.display = 'flex';
  overlay.classList.remove('animating-transfer');

  // overlay 始终保持 display:flex（用 visibility 隐藏），无需 offsetHeight 强制 reflow 触发 transition

  overlay.classList.add('open');

  // 首次打开（posterThree 未初始化）显示 loading 占位，复用时（posterThree 已存在）不显示
  if (!posterThree) {
    overlay.classList.add('poster-loading');
  }

  // 重置海报动画并开启

  if (posterAnimationId) {

    cancelAnimationFrame(posterAnimationId);

  }

  posterFrame = 0;

  renderPosterPlanet(s);

  isCardOpening = false;

  // 滚动到顶部

  const infoScroll = overlay.querySelector('.poster-info-scroll');

  if (infoScroll) infoScroll.scrollTop = 0;

  updateSidebar(s);

}

function getScreenPos(s) {

  return { x: s._x || CX, y: s._y || CY };

}

function findScientist(nameOrId) {

  return scientistMap[nameOrId] ||

    scientists.find(s => s.name.includes(nameOrId) || nameOrId.includes(s._cnName));

}

// ═══════════════════════════════════════════════════════════════

//  对焦与缩放辅助函数 (Zodiac Constellation Focus & Zoom Helpers)

// ═══════════════════════════════════════════════════════════════

function focusConstellation(constellationNum) {

  const center = CONSTELLATION_CENTERS[constellationNum];

  if (!center) return;

  camera.targetX = center.x * W * 0.45;

  camera.targetY = center.y * H * 0.45;

  camera.targetZoom = 2.4;

  camera.activeConstellation = constellationNum;

  document.querySelectorAll('.const-btn').forEach(b => {

    b.classList.toggle('active', parseInt(b.dataset.constellation) === constellationNum);

  });

  filterConstellation = constellationNum;

  const backBtn = document.getElementById('back-btn');

  if (backBtn) backBtn.classList.add('show');

  updateCount();

}

function resetFocus() {

  camera.targetX = 0;

  camera.targetY = 0;

  camera.targetZoom = 1.0;

  camera.activeConstellation = null;

  document.querySelectorAll('.const-btn').forEach(b => {

    b.classList.toggle('active', parseInt(b.dataset.constellation) === 0);

  });

  filterConstellation = 0;

  const backBtn = document.getElementById('back-btn');

  if (backBtn) backBtn.classList.remove('show');

  deselectScientist();

  updateCount();

}

// ═══════════════════════════════════════════════════════════════

//  控制栏 & 按钮交互

// ═══════════════════════════════════════════════════════════════

const constButtons = document.querySelectorAll('.const-btn');

constButtons.forEach(btn => {

  btn.addEventListener('click', () => {

    const constellation = parseInt(btn.dataset.constellation);

    if (constellation === 0) {

      resetFocus();

    } else {

      focusConstellation(constellation);

    }

  });

});

const backBtn = document.getElementById('back-btn');

if (backBtn) {

  backBtn.addEventListener('click', () => {

    resetFocus();

  });

}

const coreBtn = document.getElementById('core-btn');

if (coreBtn) {

  coreBtn.addEventListener('click', function() {

    coreOnly = !coreOnly;

    this.classList.toggle('active', coreOnly);

    updateCount();

  });

}

const searchInput = document.getElementById('search');

if (searchInput) {

  searchInput.addEventListener('input', function() {

    searchQuery = this.value.toLowerCase().trim();

    updateCount();

  });

}

document.getElementById('poster-close').addEventListener('click', deselectScientist);

document.getElementById('poster-overlay').addEventListener('click', e => {

  if (e.target === document.getElementById('poster-overlay')) deselectScientist();

});

// ═══════════════════════════════════════════════════════════════

//  高考全息控制面板联动与科幻画布渲染组 (仿制 7268a58c 交互引擎)

// ═══════════════════════════════════════════════════════════════

function focusAndScroll(constellationNum) {

  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {

    focusConstellation(constellationNum);

  }, 380);

}

window.focusAndScroll = focusAndScroll;

let dashAnimFrameId = null;

let isDashboardVisible = false;

function initDashboardGraphics() {

  const dashSection = document.getElementById('dashboard-section');

  if (!dashSection) return;

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(e => {

      isDashboardVisible = e.isIntersecting;

      if (isDashboardVisible) {

        if (!dashAnimFrameId) {

          renderDashboardGraphics();

        }

      } else {

        if (dashAnimFrameId) {

          cancelAnimationFrame(dashAnimFrameId);

          dashAnimFrameId = null;

        }

      }

    });

  }, { threshold: 0.05 });

  observer.observe(dashSection);

}

function renderDashboardGraphics() {

  if (!isDashboardVisible) return;

  dashAnimFrameId = requestAnimationFrame(renderDashboardGraphics);

  const time = Date.now() * 0.001;

  const planetCanvas = document.getElementById('wireframe-planet');

  if (planetCanvas) drawWireframePlanet(planetCanvas, time);

  const canvas1 = document.getElementById('card-canvas-1');

  if (canvas1) drawSchrodingerGraphics(canvas1, time);

  const canvas2 = document.getElementById('card-canvas-2');

  if (canvas2) drawDnaGraphics(canvas2, time);

  const listCanvas1 = document.getElementById('list-canvas-1');

  if (listCanvas1) drawGeneticsRadar(listCanvas1, time);

  const listCanvas2 = document.getElementById('list-canvas-2');

  if (listCanvas2) drawMetabolismTracer(listCanvas2, time);

  const copilotCanvas = document.getElementById('copilot-canvas');

  if (copilotCanvas) drawCopilotVisor(copilotCanvas, time);

}

function drawWireframePlanet(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  const r = 36; // radius of sphere

  ctx.save();

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.4)';

  ctx.lineWidth = 0.8;

  const rotY = t * 0.4;

  const rotX = 0.3; // tilt

  // Function to rotate a 3D point (px,py,pz) around Y and X axes

  function rotateAndProject(px, py, pz) {

    // Rotate Y

    let x1 = px * Math.cos(rotY) - pz * Math.sin(rotY);

    let z1 = px * Math.sin(rotY) + pz * Math.cos(rotY);

    // Rotate X (tilt)

    let y2 = py * Math.cos(rotX) - z1 * Math.sin(rotX);

    let z2 = py * Math.sin(rotX) + z1 * Math.cos(rotX);

    // Perspective projection

    const dist = 120;

    const scale = dist / (dist + z2);

    return {

      x: cx + x1 * scale,

      y: cy + y2 * scale,

      z: z2

    };

  }

  // Draw latitude circles

  const latCount = 7;

  for (let i = 1; i < latCount; i++) {

    const phi = (i / latCount) * Math.PI;

    const lr = r * Math.sin(phi);

    const ly = r * Math.cos(phi);

    ctx.beginPath();

    for (let theta = 0; theta <= Math.PI * 2 + 0.1; theta += 0.1) {

      const lx = lr * Math.cos(theta);

      const lz = lr * Math.sin(theta);

      const p = rotateAndProject(lx, ly, lz);

      if (theta === 0) ctx.moveTo(p.x, p.y);

      else ctx.lineTo(p.x, p.y);

    }

    ctx.stroke();

  }

  // Draw longitude circles (meridians)

  const lonCount = 8;

  for (let i = 0; i < lonCount; i++) {

    const theta = (i / lonCount) * Math.PI * 2;

    ctx.beginPath();

    for (let phi = 0; phi <= Math.PI + 0.05; phi += 0.05) {

      const lx = r * Math.sin(phi) * Math.cos(theta);

      const ly = r * Math.cos(phi);

      const lz = r * Math.sin(phi) * Math.sin(theta);

      const p = rotateAndProject(lx, ly, lz);

      if (phi === 0) ctx.moveTo(p.x, p.y);

      else ctx.lineTo(p.x, p.y);

    }

    ctx.stroke();

  }

  // Draw sphere outline

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.65)';

  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.arc(cx, cy, r, 0, Math.PI * 2);

  ctx.stroke();

  // Draw an constellation ring tilted

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.3)';

  ctx.lineWidth = 0.6;

  ctx.beginPath();

  const ringR = r * 1.5;

  for (let theta = 0; theta <= Math.PI * 2 + 0.08; theta += 0.08) {

    let rx = ringR * Math.cos(theta);

    let rz = ringR * Math.sin(theta);

    let ry = rx * 0.25;

    const p = rotateAndProject(rx, ry, rz);

    if (theta === 0) ctx.moveTo(p.x, p.y);

    else ctx.lineTo(p.x, p.y);

  }

  ctx.stroke();

  // Draw tiny circling satellite

  const satAng = t * 1.2;

  const satX = r * 1.55 * Math.cos(satAng);

  const satZ = r * 1.55 * Math.sin(satAng);

  const satY = satX * 0.25;

  const satP = rotateAndProject(satX, satY, satZ);

  ctx.fillStyle = '#ffd13b';

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 8;

  ctx.beginPath();

  ctx.arc(satP.x, satP.y, 2.5, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

}

function drawSchrodingerGraphics(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  ctx.save();

  // Grid background

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.03)';

  ctx.lineWidth = 0.5;

  for (let x = 0; x < cw; x += 16) {

    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();

  }

  for (let y = 0; y < ch; y += 16) {

    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();

  }

  // Outer HUD circle

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.15)';

  ctx.lineWidth = 0.8;

  ctx.beginPath();

  ctx.arc(cx, cy, 65, 0, Math.PI * 2);

  ctx.stroke();

  // Circular tick marks

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.25)';

  ctx.lineWidth = 1;

  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 18) {

    const x1 = cx + Math.cos(angle) * 65;

    const y1 = cy + Math.sin(angle) * 65;

    const x2 = cx + Math.cos(angle) * (angle % (Math.PI / 3) < 0.1 ? 58 : 62);

    const y2 = cy + Math.sin(angle) * (angle % (Math.PI / 3) < 0.1 ? 58 : 62);

    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

  }

  // Draw logarithmic organic spiral

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.7)';

  ctx.shadowColor = 'rgba(255, 209, 59, 0.4)';

  ctx.shadowBlur = 6;

  ctx.lineWidth = 1.5;

  ctx.beginPath();

  const spiralA = 2;

  const spiralB = 0.14;

  const maxTheta = Math.PI * 6.5; // spiral wraps multiple times

  for (let theta = 0; theta < maxTheta; theta += 0.05) {

    const rad = spiralA * Math.exp(spiralB * theta);

    const angle = theta + t * 0.8;

    const sx = cx + rad * Math.cos(angle);

    const sy = cy + rad * Math.sin(angle);

    if (theta === 0) ctx.moveTo(sx, sy);

    else ctx.lineTo(sx, sy);

  }

  ctx.stroke();

  // Flowing glowing nodes along the spiral

  ctx.fillStyle = '#ffffff';

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 10;

  // We can draw 3 floating glowing beads

  for (let bead = 0; bead < 4; bead++) {

    const baseTheta = ((t * 0.75 + bead * 1.5) % 3.0) * Math.PI * 2;

    const rad = spiralA * Math.exp(spiralB * baseTheta);

    const angle = baseTheta + t * 0.8;

    if (rad < 62) {

      const sx = cx + rad * Math.cos(angle);

      const sy = cy + rad * Math.sin(angle);

      ctx.beginPath();

      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);

      ctx.fill();

    }

  }

  // Central pulsing bio-cortex core

  const pulse = 12 + Math.sin(t * 4) * 2;

  const radG = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);

  radG.addColorStop(0, '#ffffff');

  radG.addColorStop(0.3, 'rgba(255, 209, 59, 0.85)');

  radG.addColorStop(0.7, 'rgba(255, 209, 59, 0.25)');

  radG.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = radG;

  ctx.shadowBlur = 0;

  ctx.beginPath();

  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

}

function drawDnaGraphics(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  ctx.save();

  // Grid background

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.02)';

  ctx.lineWidth = 0.5;

  for (let x = 0; x < cw; x += 20) {

    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();

  }

  // Spacecraft vertical float

  const yFloat = Math.sin(t * 1.6) * 6;

  const sy = cy - 25 + yFloat; // base spaceship center y position

  // 1. Draw scanner laser beam cone (glowing gold) extending to bottom

  const beamGrad = ctx.createLinearGradient(cx - 15, sy, cx + 15, ch);

  beamGrad.addColorStop(0, 'rgba(255, 209, 59, 0.7)');

  beamGrad.addColorStop(0.1, 'rgba(255, 209, 59, 0.45)');

  beamGrad.addColorStop(0.7, 'rgba(255, 209, 59, 0.08)');

  beamGrad.addColorStop(1, 'rgba(255, 209, 59, 0)');

  ctx.fillStyle = beamGrad;

  ctx.beginPath();

  ctx.moveTo(cx - 3, sy + 6);

  ctx.lineTo(cx + 3, sy + 6);

  ctx.lineTo(cx + 25, ch);

  ctx.lineTo(cx - 25, ch);

  ctx.closePath();

  ctx.fill();

  // 2. Horizontal scanning bar inside laser beam

  const scanY = sy + 6 + ((t * 40) % (ch - sy - 6));

  const scanWidth = 6 + (20 * (scanY - sy)) / (ch - sy);

  const scanGrad = ctx.createLinearGradient(cx - scanWidth, scanY, cx + scanWidth, scanY);

  scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');

  scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');

  scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.strokeStyle = scanGrad;

  ctx.lineWidth = 2.0;

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 8;

  ctx.beginPath();

  ctx.moveTo(cx - scanWidth, scanY);

  ctx.lineTo(cx + scanWidth, scanY);

  ctx.stroke();

  ctx.shadowBlur = 0;

  // 3. Draw sleek sci-fi saucer spacecraft (Pagoda style)

  // Central saucer main hull

  ctx.fillStyle = '#1b1732';

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.5;

  // Outer wings

  ctx.beginPath();

  ctx.moveTo(cx - 45, sy);

  ctx.lineTo(cx - 15, sy - 8);

  ctx.lineTo(cx - 8, sy - 18);

  ctx.lineTo(cx + 8, sy - 18);

  ctx.lineTo(cx + 15, sy - 8);

  ctx.lineTo(cx + 45, sy);

  ctx.lineTo(cx + 12, sy + 6);

  ctx.lineTo(cx - 12, sy + 6);

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  // Upper dome (the pagoda structure)

  ctx.fillStyle = '#2c2552';

  ctx.beginPath();

  ctx.moveTo(cx - 15, sy - 8);

  ctx.quadraticCurveTo(cx, sy - 18, cx + 15, sy - 8);

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  ctx.fillStyle = '#100c24';

  ctx.beginPath();

  ctx.moveTo(cx - 8, sy - 18);

  ctx.lineTo(cx, sy - 28);

  ctx.lineTo(cx + 8, sy - 18);

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  // Antenna on top

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.0;

  ctx.beginPath();

  ctx.moveTo(cx, sy - 28);

  ctx.lineTo(cx, sy - 36);

  ctx.stroke();

  ctx.fillStyle = '#ffffff';

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 8;

  ctx.beginPath();

  ctx.arc(cx, sy - 36, 2.0, 0, Math.PI * 2);

  ctx.fill();

  ctx.shadowBlur = 0;

  // Glowing core under ship emitting the beam

  const corePulse = 4.0 + Math.sin(t * 8) * 1.5;

  ctx.fillStyle = '#ffffff';

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 10;

  ctx.beginPath();

  ctx.arc(cx, sy + 3, corePulse, 0, Math.PI * 2);

  ctx.fill();

  // Saucer wing lights

  ctx.fillStyle = '#ffd13b';

  ctx.beginPath();

  ctx.arc(cx - 28, sy - 1, 1.5, 0, Math.PI * 2);

  ctx.arc(cx + 28, sy - 1, 1.5, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

}

function drawGeneticsRadar(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  ctx.save();

  // Scrolling star dust background

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

  for (let i = 0; i < 8; i++) {

    const starX = ((i * 35 - t * 15) % cw + cw) % cw;

    const starY = (i * 12 + 10) % ch;

    ctx.beginPath(); ctx.arc(starX, starY, 0.8, 0, Math.PI * 2); ctx.fill();

  }

  // 1. Draw pulsing radio telemetry scanner waves

  ctx.save();

  ctx.translate(cx - 24, cy - 14); // wave origin (feed horn position)

  ctx.rotate(0.3); // align with dish angle

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.5)';

  ctx.lineWidth = 1.0;

  ctx.shadowBlur = 4;

  ctx.shadowColor = '#ffd13b';

  for (let wave = 0; wave < 3; wave++) {

    const radius = ((t * 30 + wave * 22) % 66);

    const alpha = 1.0 - (radius / 66);

    ctx.strokeStyle = `rgba(255, 209, 59, ${alpha * 0.75})`;

    ctx.beginPath();

    ctx.arc(0, 0, radius, -Math.PI * 0.8, -Math.PI * 0.2);

    ctx.stroke();

  }

  ctx.restore();

  // 2. Draw satellite dish

  ctx.save();

  ctx.translate(cx + 8, cy + 8); // position of satellite body center

  ctx.rotate(0.35 + Math.sin(t * 0.4) * 0.08); // slow panning scan rotation

  // Solar panels

  ctx.fillStyle = '#0f173b';

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.2;

  // Left panel

  ctx.beginPath();

  ctx.moveTo(10, 8);

  ctx.lineTo(38, 16);

  ctx.lineTo(34, 28);

  ctx.lineTo(6, 20);

  ctx.closePath();

  ctx.fill(); ctx.stroke();

  // panel cells inside

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.4)';

  ctx.lineWidth = 0.5;

  ctx.beginPath();

  ctx.moveTo(24, 12); ctx.lineTo(20, 24);

  ctx.moveTo(18, 10); ctx.lineTo(14, 22);

  ctx.moveTo(30, 14); ctx.lineTo(26, 26);

  ctx.stroke();

  // Right panel

  ctx.fillStyle = '#0f173b';

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.moveTo(-10, -8);

  ctx.lineTo(-38, -16);

  ctx.lineTo(-34, -28);

  ctx.lineTo(-6, -20);

  ctx.closePath();

  ctx.fill(); ctx.stroke();

  // Satellite main body cube

  ctx.fillStyle = '#1b1732';

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.5;

  ctx.beginPath();

  ctx.roundRect(-10, -8, 20, 16, 3);

  ctx.fill();

  ctx.stroke();

  // Telemetry antenna dish arm extending left-upward

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.moveTo(-6, -4);

  ctx.lineTo(-24, -18);

  ctx.stroke();

  // Curved parabolic reflector dish

  ctx.fillStyle = '#2c2552';

  ctx.beginPath();

  ctx.moveTo(-15, -28);

  ctx.quadraticCurveTo(-34, -14, -25, 4);

  ctx.lineTo(-20, 2);

  ctx.quadraticCurveTo(-28, -12, -11, -24);

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  // Central feed horn collector node

  ctx.fillStyle = '#ffffff';

  ctx.shadowBlur = 6;

  ctx.shadowColor = '#ffd13b';

  ctx.beginPath();

  ctx.arc(-24, -18, 2.5, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

  ctx.restore();

}

function drawMetabolismTracer(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  ctx.save();

  // Scrolling stars

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

  for (let i = 0; i < 8; i++) {

    const starX = ((i * 45 - t * 8) % cw + cw) % cw;

    const starY = (i * 15 + 8) % ch;

    ctx.beginPath(); ctx.arc(starX, starY, 0.8, 0, Math.PI * 2); ctx.fill();

  }

  // 1. Draw Giant Ringed Gas Planet (Saturn-like)

  const px = cx - 18; // planet position X

  const py = cy - 4;  // planet position Y

  const pr = 22;      // planet sphere radius

  // Save context for planet clipping and drawing

  ctx.save();

  // Planet body glowing atmospheric backing

  const planetAtmG = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 1.3);

  planetAtmG.addColorStop(0, 'rgba(108, 78, 151, 0.6)');

  planetAtmG.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = planetAtmG;

  ctx.beginPath(); ctx.arc(px, py, pr * 1.3, 0, Math.PI * 2); ctx.fill();

  // Planet body (clipped to sphere)

  ctx.beginPath();

  ctx.arc(px, py, pr, 0, Math.PI * 2);

  ctx.clip();

  // Gas bands inside planet

  const bandG = ctx.createLinearGradient(px - pr, py - pr, px - pr, py + pr);

  bandG.addColorStop(0, '#1c103a');

  bandG.addColorStop(0.2, '#382068');

  bandG.addColorStop(0.35, '#ffd13b');

  bandG.addColorStop(0.5, '#402a70');

  bandG.addColorStop(0.7, '#1b1236');

  bandG.addColorStop(0.85, '#e0a030');

  bandG.addColorStop(1, '#0e0820');

  ctx.fillStyle = bandG;

  ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

  // Planet body shadows (3D shape)

  const shadowG = ctx.createRadialGradient(px - pr*0.3, py - pr*0.3, 0, px, py, pr);

  shadowG.addColorStop(0, 'rgba(255, 255, 255, 0.15)');

  shadowG.addColorStop(0.6, 'rgba(0, 0, 0, 0.45)');

  shadowG.addColorStop(1, 'rgba(0, 0, 0, 0.92)');

  ctx.fillStyle = shadowG;

  ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);

  ctx.restore();

  // 2. Draw Planet Rings

  ctx.save();

  ctx.translate(px, py);

  ctx.rotate(0.3); // tilt the rings

  ctx.scale(1.0, 0.28); // squeeze for ellipse projection

  // Rings draw

  const drawRings = (alphaMult) => {

    ctx.strokeStyle = `rgba(255, 209, 59, ${0.45 * alphaMult})`;

    ctx.lineWidth = 4;

    ctx.beginPath(); ctx.arc(0, 0, pr * 2.0, 0, Math.PI * 2); ctx.stroke();

    ctx.strokeStyle = `rgba(130, 80, 240, ${0.35 * alphaMult})`;

    ctx.lineWidth = 3;

    ctx.beginPath(); ctx.arc(0, 0, pr * 1.5, 0, Math.PI * 2); ctx.stroke();

  };

  drawRings(0.75);

  ctx.restore();

  // 3. Draw sleek space cruiser flying across

  const shipX = cx + 22 + Math.cos(t * 1.2) * 26;

  const shipY = cy + 10 + Math.sin(t * 2.4) * 8;

  ctx.save();

  ctx.translate(shipX, shipY);

  const vx = -Math.sin(t * 1.2) * 26 * 1.2;

  const vy = Math.cos(t * 2.4) * 8 * 2.4;

  const angle = Math.atan2(vy, vx);

  ctx.rotate(angle);

  // Engine exhaust flame

  const flameSize = 6 + Math.random() * 4;

  const flameGrad = ctx.createLinearGradient(0, 0, flameSize, 0);

  flameGrad.addColorStop(0, '#ffffff');

  flameGrad.addColorStop(0.3, '#ffd13b');

  flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = flameGrad;

  ctx.beginPath();

  ctx.moveTo(6, 0);

  ctx.lineTo(6 + flameSize, 0);

  ctx.lineTo(6 + flameSize * 0.4, -3);

  ctx.closePath();

  ctx.fill();

  // Ship hull

  ctx.fillStyle = '#1b1732';

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.0;

  ctx.beginPath();

  ctx.moveTo(-8, 0);       // nose

  ctx.lineTo(6, -4);       // top-back wing joint

  ctx.lineTo(4, -1);       // back center

  ctx.lineTo(6, 4);        // bottom-back wing joint

  ctx.closePath();

  ctx.fill(); ctx.stroke();

  // Wing details

  ctx.strokeStyle = '#2dd4e8';

  ctx.beginPath();

  ctx.moveTo(2, -2); ctx.lineTo(-2, 0); ctx.lineTo(2, 2);

  ctx.stroke();

  ctx.restore();

  ctx.restore();

}

function drawCopilotVisor(canvas, t) {

  const ctx = canvas.getContext('2d');

  const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;

  const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cw = canvas.clientWidth, ch = canvas.clientHeight;

  ctx.clearRect(0, 0, cw, ch);

  const cx = cw / 2, cy = ch / 2;

  ctx.save();

  // 1. Sunset gradient background sky

  const skyG = ctx.createLinearGradient(0, 0, 0, ch);

  skyG.addColorStop(0, '#0c071d');   // dark top

  skyG.addColorStop(0.4, '#24103c'); // purple

  skyG.addColorStop(0.75, '#5d2650'); // sunset reddish-purple

  skyG.addColorStop(1, '#ffac33');    // golden horizon sunset

  ctx.fillStyle = skyG;

  ctx.fillRect(0, 0, cw, ch);

  // 2. Draw background monolith pillars

  ctx.fillStyle = '#100a22';

  ctx.beginPath();

  ctx.roundRect(14, cy - 35, 10, 80, 2);

  ctx.fill();

  ctx.beginPath();

  ctx.roundRect(cw - 24, cy - 48, 8, 90, 2);

  ctx.fill();

  // Midground hills/ground silhouette

  ctx.fillStyle = '#130d2a';

  ctx.beginPath();

  ctx.moveTo(0, ch - 22);

  ctx.quadraticCurveTo(cx, ch - 30, cw, ch - 22);

  ctx.lineTo(cw, ch);

  ctx.lineTo(0, ch);

  ctx.closePath();

  ctx.fill();

  // 3. Draw traveler antenna

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.5;

  ctx.beginPath();

  ctx.moveTo(cx - 24, cy + 20);

  ctx.lineTo(cx - 36, cy - 8);

  ctx.stroke();

  ctx.fillStyle = '#ffffff';

  ctx.shadowColor = '#ffd13b';

  ctx.shadowBlur = 6;

  ctx.beginPath();

  ctx.arc(cx - 36, cy - 8, 2.5, 0, Math.PI * 2);

  ctx.fill();

  ctx.shadowBlur = 0;

  // 4. Traveler Hood Cloak and shoulder folds

  ctx.fillStyle = '#110c25';

  ctx.beginPath();

  ctx.moveTo(cx - 45, ch);

  ctx.quadraticCurveTo(cx - 38, cy + 26, cx - 24, cy + 20);

  ctx.quadraticCurveTo(cx, cy + 18, cx + 24, cy + 20);

  ctx.quadraticCurveTo(cx + 38, cy + 26, cx + 45, ch);

  ctx.closePath();

  ctx.fill();

  // Outer Hood

  ctx.fillStyle = '#150f2f';

  ctx.strokeStyle = 'rgba(255, 209, 59, 0.18)';

  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.moveTo(cx - 28, ch - 5);

  ctx.quadraticCurveTo(cx - 32, cy - 25, cx, cy - 28);

  ctx.quadraticCurveTo(cx + 32, cy - 25, cx + 28, ch - 5);

  ctx.lineTo(cx + 20, ch);

  ctx.lineTo(cx - 20, ch);

  ctx.closePath();

  ctx.fill();

  ctx.stroke();

  // Inner shadow

  ctx.fillStyle = '#090615';

  ctx.beginPath();

  ctx.moveTo(cx - 18, cy + 25);

  ctx.quadraticCurveTo(cx - 20, cy - 14, cx, cy - 17);

  ctx.quadraticCurveTo(cx + 20, cy - 14, cx + 18, cy + 25);

  ctx.closePath();

  ctx.fill();

  // 5. Visor

  const vr = 12; // visor radius

  const vy = cy + 2; // visor y center

  ctx.save();

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 1.8;

  ctx.shadowColor = 'rgba(255, 209, 59, 0.9)';

  ctx.shadowBlur = 10;

  ctx.fillStyle = 'rgba(12, 7, 30, 0.95)';

  ctx.beginPath();

  ctx.arc(cx, vy, vr, 0, Math.PI * 2);

  ctx.fill();

  ctx.stroke();

  ctx.restore();

  // Scanlines/waveform inside visor

  ctx.save();

  ctx.beginPath();

  ctx.arc(cx, vy, vr - 0.5, 0, Math.PI * 2);

  ctx.clip();

  ctx.strokeStyle = '#ffd13b';

  ctx.lineWidth = 0.8;

  ctx.beginPath();

  for (let i = -vr; i <= vr; i += 1.5) {

    const wx = cx + i;

    const phase = (wx * 0.28) - t * 10.0;

    const env = Math.cos((i / vr) * Math.PI / 2);

    const wy = vy + Math.sin(phase) * 3 * env;

    if (i === -vr) ctx.moveTo(wx, wy);

    else ctx.lineTo(wx, wy);

  }

  ctx.stroke();

  // Highlight reflection

  const glassG = ctx.createLinearGradient(cx - vr, vy - vr, cx + vr, vy + vr);

  glassG.addColorStop(0, 'rgba(255, 255, 255, 0.22)');

  glassG.addColorStop(0.4, 'rgba(255, 255, 255, 0)');

  glassG.addColorStop(1, 'rgba(255, 209, 59, 0.15)');

  ctx.fillStyle = glassG;

  ctx.beginPath();

  ctx.arc(cx, vy, vr, 0, Math.PI * 2);

  ctx.fill();

  ctx.restore();

  ctx.restore();

}

// ═══════════════════════════════════════════════════════════════

//  Awwwards-Style Web Audio API Sound Engine

// ═══════════════════════════════════════════════════════════════

let audioCtx = null;

let ambientGainNode = null;

let isAudioEnabled = false;

function initAudio() {

  if (audioCtx) return;

  try {

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  } catch (err) {

    console.error('音频引擎初始化失败:', err);

  }

}

function toggleAudio() {

  if (!audioCtx) {

    initAudio();

  }

  if (audioCtx && audioCtx.state === 'suspended') {

    audioCtx.resume();

  }

  const toggleBtn = document.getElementById('sound-toggle');

  if (!isAudioEnabled) {

    isAudioEnabled = true;

    toggleBtn.classList.add('active');

    toggleBtn.querySelector('.sound-text').textContent = '声场';

    playPing(440, 'sine', 0.25, 0.05); // 播放启动反馈

  } else {

    isAudioEnabled = false;

    toggleBtn.classList.remove('active');

    toggleBtn.querySelector('.sound-text').textContent = '静音';

  }

}

function playTick() {

  if (!isAudioEnabled || !audioCtx) return;

  try {

    const time = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();

    const gain = audioCtx.createGain();

    osc.type = 'sine';

    osc.frequency.setValueAtTime(1400, time);

    osc.frequency.exponentialRampToValueAtTime(300, time + 0.04);

    gain.gain.setValueAtTime(0.015, time);

    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);

    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(time + 0.05);

  } catch (e) {}

}

function playPing(freq = 880, type = 'triangle', duration = 0.4, maxGain = 0.08) {

  if (!isAudioEnabled || !audioCtx) return;

  try {

    const time = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();

    const gain = audioCtx.createGain();

    const filter = audioCtx.createBiquadFilter();

    osc.type = type;

    osc.frequency.setValueAtTime(freq, time);

    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, time + duration);

    filter.type = 'bandpass';

    filter.frequency.setValueAtTime(freq, time);

    filter.Q.setValueAtTime(1.5, time);

    gain.gain.setValueAtTime(0.001, time);

    gain.gain.linearRampToValueAtTime(maxGain, time + 0.02);

    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);

    filter.connect(gain);

    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(time + duration + 0.05);

  } catch (e) {}

}

function navigatePoster(direction) {

  if (!selectedId) return;

  const s = scientistMap[selectedId];

  if (!s) return;

  // 获取同轨道的科学家列表

  const list = scientists.filter(sci => sci.constellation === s.constellation);

  if (list.length <= 1) return;

  const idx = list.findIndex(sci => sci.id === s.id);

  let nextIdx;

  if (direction === 'next') {

    nextIdx = (idx + 1) % list.length;

  } else {

    nextIdx = (idx - 1 + list.length) % list.length;

  }

  const nextSci = list[nextIdx];

  if (nextSci) {

    if (posterAnimationId) {

      cancelAnimationFrame(posterAnimationId);

    }

    // 选中新的科学家

    selectScientist(nextSci);

    // 播放切换声音

    const freqMap = { 1: 329.63, 2: 392.00, 3: 440.00, 4: 523.25, 5: 587.33 };

    const baseFreq = freqMap[nextSci.constellation] || 440;

    playPing(baseFreq, 'sine', 0.5, 0.08);

  }

}

function findMethod(name) {

  if (!name) return null;

  name = name.trim();

  // 1. Exact match

  if (methodsMap[name]) return methodsMap[name];

  // 2. Substring matching

  for (const key of Object.keys(methodsMap)) {

    if (key.length >= 2 && (name.includes(key) || key.includes(name))) {

      return methodsMap[key];

    }

  }

  // 3. Robust Keyword Semantic Mapping

  const keywordMap = {

    '减法': '加法与减法原理',

    '加法': '加法与减法原理',

    '同位素': '同位素标记法',

    '放射性': '同位素标记法',

    '示踪': '显微观察与示踪技术',

    '差速': '差速离心法',

    '梯度离心': '密度梯度离心技术',

    '纸层析': '纸层析技术',

    '层析': '纸层析技术',

    '假说': '假说-演绎法',

    '演绎': '假说-演绎法',

    '类比': '类比推理法',

    'PCR': 'PCR技术',

    '双脱氧': '双脱氧链终止法',

    '桑格': '双脱氧链终止法',

    '归纳': '归纳法',

    '微生物': '微生物培养技术',

    '显微': '显微观察与示踪技术',

    '查哥夫': '查哥夫法则',

    '样方': '样方法与标记重捕法',

    '重捕': '样方法与标记重捕法',

    '模型构建': '模型构建法',

    '建模': '物理与数学建模',

    '科赫': '科赫法则',

    '对比': '对比实验法',

    '统计': '统计学分析法'

  };

  for (const keyword of Object.keys(keywordMap)) {

    if (name.includes(keyword)) {

      return methodsMap[keywordMap[keyword]];

    }

  }

  return null;

}

function parseMarkdownToHtml(md) {

  if (!md) return '';

  let html = md.replace(/\r\n/g, '\n');

  // Headers

  html = html.replace(/^###\s*(.+)$/gm, '<h4 class="method-sub-title">$1</h4>');

  html = html.replace(/^##\s*(.+)$/gm, '<h3 class="method-section-title">$1</h3>');

  html = html.replace(/^#\s*(.+)$/gm, '<h2 class="method-main-title">$1</h2>');

  // Wiki links

  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, label) => {

    const displayText = label ? label.trim() : target.trim();

    const cleanTarget = target.trim();

    let type = 'unknown';

    if (scientistMap[cleanTarget]) {

      type = 'scientist';

    } else if (methodsMap[cleanTarget]) {

      type = 'method';

    } else if (storyMap[cleanTarget]) {

      type = 'story';

    }

    return `<span class="wiki-link-span" data-type="${type}" data-target="${cleanTarget}">${displayText}</span>`;

  });

  // Bold

  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

  // Lists

  const lines = html.split('\n');

  let result = [];

  let inUl = false;

  let inOl = false;

  for (let line of lines) {

    let trimmed = line.trim();

    const ulMatch = line.match(/^([ \t]*)[-*+]\s+(.+)$/);

    const olMatch = line.match(/^([ \t]*)\d+\.\s+(.+)$/);

    if (ulMatch) {

      if (inOl) {

        result.push('</ol>');

        inOl = false;

      }

      if (!inUl) {

        result.push('<ul class="method-ul">');

        inUl = true;

      }

      result.push(`<li>${ulMatch[2]}</li>`);

    } else if (olMatch) {

      if (inUl) {

        result.push('</ul>');

        inUl = false;

      }

      if (!inOl) {

        result.push('<ol class="method-ol">');

        inOl = true;

      }

      result.push(`<li>${olMatch[2]}</li>`);

    } else {

      if (inUl) {

        result.push('</ul>');

        inUl = false;

      }

      if (inOl) {

        result.push('</ol>');

        inOl = false;

      }

      if (trimmed === '') {

        result.push('<br>');

      } else if (!trimmed.startsWith('<h') && !trimmed.startsWith('<b')) {

        result.push(`<p class="method-p">${line}</p>`);

      } else {

        result.push(line);

      }

    }

  }

  if (inUl) result.push('</ul>');

  if (inOl) result.push('</ol>');

  return result.join('\n');

}

function showMethodDetail(m) {

  const overlay = document.getElementById('method-overlay');

  if (!overlay) return;

  document.getElementById('method-title').textContent = m.title;

  document.getElementById('method-quote').textContent = m.quote || '';

  const mag = m.magnitude || 3;

  document.getElementById('method-magnitude-val').textContent = `${mag} / 5`;

  document.getElementById('method-stars-val').textContent = '★'.repeat(mag) + '☆'.repeat(5 - mag);

  const bodyHtml = parseMarkdownToHtml(m.body);

  document.getElementById('method-info-body').innerHTML = bodyHtml;

  // Setup wiki-links clicks

  document.getElementById('method-info-body').querySelectorAll('.wiki-link-span').forEach(span => {

    const target = span.dataset.target;

    const type = span.dataset.type;

    if (type === 'scientist') {

      span.classList.add('wiki-scientist-link');

    } else if (type === 'method') {

      span.classList.add('wiki-method-link');

    } else if (type === 'story') {

      span.classList.add('wiki-story-link');

    }

    span.addEventListener('click', (e) => {

      e.stopPropagation();

      if (type === 'scientist') {

        const sci = scientistMap[target];

        if (sci) {

          closeMethodDetail();

          selectScientist(sci);

        }

      } else if (type === 'method') {

        const meth = methodsMap[target];

        if (meth) {

          showMethodDetail(meth);

        }

      } else if (type === 'story') {

        const story = storyMap[target];

        if (story) {

          showStoryDetail(story);

        }

      }

    });

  });

  // Play transition chime

  if (typeof playPing === 'function') {

    // resound at 523.25Hz (C5)

    playPing(523.25, 'sine', 0.4, 0.08);

  }

  overlay.style.display = 'flex';

  overlay.offsetHeight;

  overlay.classList.add('open');

}

function closeMethodDetail() {

  const overlay = document.getElementById('method-overlay');

  if (overlay) {

    overlay.classList.remove('open');

    setTimeout(() => {

      overlay.style.display = 'none';

    }, 350);

  }

}

function showStoryDetail(st) {

  loadData().then(() => {

    initDashboardGraphics();

  }).catch(err => {

    const bootStatus = document.getElementById('boot-status-text');
    if (bootStatus) bootStatus.innerHTML = `<span style="color:#f88">加载失败: ${err.message}</span>`;

  });

  const overlay = document.getElementById('method-overlay');

  if (!overlay) return;

  // 复用 method-overlay 结构，填充故事内容

  const typeEl = document.getElementById('method-type');

  const titleEl = document.getElementById('method-title');

  const quoteEl = document.getElementById('method-quote');

  const magValEl = document.getElementById('method-magnitude-val');

  const starsValEl = document.getElementById('method-stars-val');

  const bodyEl = document.getElementById('method-info-body');

  if (typeEl) typeEl.textContent = `STORY ARCHIVE // ${st.type === 'collision' ? '星系碰撞' : st.type === 'experiment' ? '核心实验' : '星图导航'}`;

  if (titleEl) titleEl.textContent = st.title || st.id;

  if (quoteEl) quoteEl.textContent = st.quote || '';

  const mag = st.magnitude || 3;

  if (magValEl) magValEl.textContent = `${mag} / 5`;

  if (starsValEl) starsValEl.textContent = '★'.repeat(mag) + '☆'.repeat(5 - mag);

  const bodyHtml = parseMarkdownToHtml(st.body || '');

  if (bodyEl) bodyEl.innerHTML = bodyHtml;

  // 绑定故事正文内的 wiki-link（支持故事→科学家/方法/故事跳转）

  if (bodyEl) {

    bodyEl.querySelectorAll('.wiki-link-span').forEach(span => {

      const target = span.dataset.target;

      const type = span.dataset.type;

      if (type === 'scientist') span.classList.add('wiki-scientist-link');

      else if (type === 'method') span.classList.add('wiki-method-link');

      else if (type === 'story') span.classList.add('wiki-story-link');

      span.addEventListener('click', (e) => {

        e.stopPropagation();

        if (type === 'scientist') {

          const sci = scientistMap[target];

          if (sci) { closeMethodDetail(); selectScientist(sci); }

        } else if (type === 'method') {

          const meth = methodsMap[target];

          if (meth) showMethodDetail(meth);

        } else if (type === 'story') {

          const story = storyMap[target];

          if (story) showStoryDetail(story);

        }

      });

    });

  }

  overlay.style.display = 'flex';

  requestAnimationFrame(() => overlay.classList.add('open'));

}



function getRelatedScientists(currentSci) {
  const related = new Map();

  if (currentSci._connections) {
    currentSci._connections.forEach(id => {
      const sci = scientistMap[id];
      if (sci && sci.id !== currentSci.id) related.set(sci.id, sci);
    });
  }

  for (const item of currentSci.intersection || []) {
    const sci = findScientist(item);
    if (sci && sci.id !== currentSci.id) related.set(sci.id, sci);
  }

  return [...related.values()]
    .sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0) || a.id.localeCompare(b.id))
    .slice(0, 8);
}

function updateSidebar(currentSci) {

  const sidebarList = document.getElementById('sidebar-scientist-list');

  if (!sidebarList) return;

  const sidebar = sidebarList.closest('.poster-sidebar');
  const relatedScientists = getRelatedScientists(currentSci);

  if (sidebar) sidebar.classList.toggle('hidden', relatedScientists.length === 0);
  sidebarList.innerHTML = '';
  if (relatedScientists.length === 0) return;

  sidebarList.innerHTML = relatedScientists.map(sci => {

    const isActive = sci.id === currentSci.id;

    const visual = getScientistVisual(sci);

    const nodeBg = isActive ?
      `radial-gradient(circle, ${visual.hex} 0%, rgba(10,8,22,1) 85%)` :
      `radial-gradient(circle, hsla(${visual.hue},${visual.saturation}%,${visual.lightness}%,0.26) 0%, rgba(15,18,32,0.54) 100%)`;

    return `

      <div class="sidebar-node ${isActive ? 'active' : ''}" 

           style="--active-color: ${visual.hex}; background: ${nodeBg};"

           data-id="${sci.id}" 

           title="${sci.name}">

        <canvas class="sidebar-node-canvas" data-id="${sci.id}" width="42" height="42" style="width: 42px; height: 42px; border-radius: 50%; pointer-events: none; display: block;"></canvas>

        <span class="sidebar-node-name">${sci._cnName || sci.id}</span>

      </div>

    `;

  }).join('');

  // Attach click listeners to sidebar nodes

  sidebarList.querySelectorAll('.sidebar-node').forEach(node => {

    node.addEventListener('click', (e) => {

      e.stopPropagation();

      const sciId = node.dataset.id;

      const targetSci = scientistMap[sciId];

      if (targetSci) {
        const rect = node.getBoundingClientRect();
        const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

        // Play chime ping

        const freqMap = { 1: 329.63, 2: 392.00, 3: 440.00, 4: 523.25, 5: 587.33 };

        const baseFreq = freqMap[targetSci.constellation] || 440;

        if (typeof playPing === 'function') {

          playPing(baseFreq, 'sine', 0.5, 0.08);

        }

        selectScientist(targetSci, { origin, animatedOpen: true });

      }

    });

  });

}

function setupAudioEvents() {

  const btn = document.getElementById('sound-toggle');

  if (btn) {

    btn.addEventListener('click', toggleAudio);

  }

  // 绑定卡片左右切换按钮事件

  // 绑定科学方法关闭事件

  const methodClose = document.getElementById('method-close');

  if (methodClose) {

    methodClose.addEventListener('click', () => {

      closeMethodDetail();

    });

  }

  const methodOverlay = document.getElementById('method-overlay');

  if (methodOverlay) {

    methodOverlay.addEventListener('click', (e) => {

      if (e.target === methodOverlay) {

        closeMethodDetail();

      }

    });

  }

  const prevBtn = document.getElementById('poster-prev-btn');

  const nextBtn = document.getElementById('poster-next-btn');

  if (prevBtn) {

    prevBtn.addEventListener('click', e => {

      e.stopPropagation();

      navigatePoster('prev');

    });

  }

  if (nextBtn) {

    nextBtn.addEventListener('click', e => {

      e.stopPropagation();

      navigatePoster('next');

    });

  }

  // 绑定全局点击音效（Event Delegation）

  document.body.addEventListener('click', e => {

    const isInteractive = e.target.closest('button') || 

                          e.target.closest('.const-btn') || 

                          e.target.closest('.p-link') ||

                          e.target.closest('.right-card-action') ||

                          e.target.closest('.card-action-btn') ||

                          e.target.closest('.poster-nav-btn') ||

                          e.target.closest('li[onclick]');

    if (isInteractive) {

      playTick();

    }

  });

}

if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', () => {
    setupAudioEvents();
  });

} else {

  setupAudioEvents();

}

// ═══════════════════════════════════════════════════════════════

//  启动

// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════

//  启动

// ═══════════════════════════════════════════════════════════════

loadData().then(() => {

  initDashboardGraphics();

}).catch(err => {

  const bootStatusText = document.getElementById('boot-status-text');
  if (bootStatusText) {
    bootStatusText.innerHTML = `<span style="color:#f88">加载失败: ${err.message}</span>`;
  }

});
