export type Category = 'Item' | 'Institution' | 'Era' | 'Decoration' | 'Feature' | 'Culture' | 'Person' | 'Paper';

export interface GraphNode {
  id: string;
  name: string;
  category: Category;
  description?: string;
  symbolSize?: number;
  imageUrl?: string;
  parentId?: string; // 专属折叠标记，代表它是哪个藏品的子属性
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Item: '#ee6666', Institution: '#fac858', Era: '#91cc75', 
  Decoration: '#73c0de', Feature: '#3ba272', Culture: '#fc8452', 
  Person: '#9a60b4', Paper: '#9b59b6'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  Item: '钧瓷藏品', Institution: '馆藏机构', Era: '所属年代', 
  Decoration: '艺术纹饰', Feature: '工艺特征', Culture: '文化标签', 
  Person: '相关人物', Paper: '学术研究'
};

export const MOCK_NODES: GraphNode[] = [];
export const MOCK_EDGES: GraphEdge[] = [];

// 工具函数：防止重复添加
const addNode = (node: GraphNode) => {
  if (!MOCK_NODES.find(n => n.id === node.id)) MOCK_NODES.push(node);
};
const addEdge = (source: string, target: string, label: string) => {
  if (!MOCK_EDGES.find(e => e.source === source && e.target === target && e.label === label)) {
    MOCK_EDGES.push({ source, target, label });
  }
};

// 1. 初始化核心星系中心：两大馆藏
['故宫博物院', '禹州钧官窑址博物馆'].forEach((name) => {
  addNode({ id: `inst_${name}`, name, category: 'Institution', symbolSize: 75, description: `${name}的钧瓷馆藏汇总` });
});

// 2. 导入 10 篇论文与核心人物
const RAW_PAPERS = [
  { name: '谈谈钧瓷的几个概念', author: '李民举', source: '故宫博物院院刊', desc: '花瓷、钧州青和钧瓷三色是文献中提及的与钧瓷有关的三个古陶瓷术语。' },
  { name: '钧瓷天蓝、天青釉色中氧化铁的呈色作用', author: '王芬 苗建民 侯佳钰 林营 朱建锋', source: '故宫博物院院刊', desc: '氧化铁在钧瓷天蓝、天青系列釉色中的着色作用以及乳光蓝色问题，一直是学术界争论的焦点。' },
  { name: '古代钧台窑钧釉“蚯蚓走泥纹”的成因探析', author: '李媛 苗建民 孙新民 冯小琦 贾翠', source: '故宫博物院院刊', desc: '探究了“蚯蚓走泥纹”的形成原因和组成特征。' },
  { name: '数字化时代下钧窑瓷器拍摄的新方法', author: '李凡', source: '故宫博物院院刊', desc: '介绍本次展览器物在数字化时代下充分利用科学技术的文物拍摄方法。' },
  { name: '钧窑概念的形成及其产品时代辨析', author: '徐华烽', source: '故宫博物院院刊', desc: '通过对文献记载和考古资料的梳理可知,钧窑的概念不是一下子形成的。' },
  { name: '钧窑考古与研究述论', author: '徐华烽 秦大树', source: '故宫博物院院刊', desc: '古代文献记载的缺失与混乱，造成对钧窑认知的一些误区。' },
  { name: '再议钧台、钧州与钧窑', author: '徐华烽', source: '故宫博物院院刊', desc: '梳理文献与考古资料可知,钧窑之名来自钧州,钧州之名来自钧台。' },
  { name: '嵌入与成长：钧窑现代陶艺的类型学研究', author: '姚瑶', source: '许昌学院学报', desc: '钧窑的历史最早可以追溯到唐宋时期，现代陶艺发生碰撞与交融。' },
  { name: '北宋还是明：“官钧”源起新论的文献考证', author: '孔大强', source: '许昌学院学报', desc: '新世纪以来，“官钧”源起“明代说”在陶瓷业界产生了不小影响。' },
  { name: '台湾地区陶艺家的钧瓷烧造实践', author: '王洪伟', source: '许昌学院学报', desc: '台湾陶艺家紧密结合和运用现代陶瓷科技新发现,推动了钧釉的工艺创新。' }
];

RAW_PAPERS.forEach((p, i) => {
  const pid = `paper_${i}`;
  addNode({ id: pid, name: p.name, category: 'Paper', symbolSize: 50, description: `【期刊】${p.source}\n【摘要】${p.desc}` });
  p.author.split(' ').forEach(author => {
    if (!author) return;
    const aid = `person_${author}`;
    addNode({ id: aid, name: author, category: 'Person', symbolSize: 40, description: '学者 / 研究专家' });
    addEdge(aid, pid, '撰写');
  });
});

// 3. 导入 30 件藏品（深度提取 年代、纹饰、工艺、文化标签）
const RAW_ITEMS = [
  { name: '钧窑天蓝釉钵', inst: '故宫博物院', era: '北宋—金', decos: [], feats: ['天蓝色釉'], cults: ['仿钧之风'], creator: '' },
  { name: '钧窑天蓝釉三足炉', inst: '故宫博物院', era: '金', decos: [], feats: ['天蓝色釉', '足施酱釉'], cults: ['陈设用瓷'], creator: '' },
  { name: '钧窑天蓝釉紫红斑碗', inst: '故宫博物院', era: '元', decos: ['紫红斑'], feats: ['天蓝釉'], cults: [], creator: '' },
  { name: '钧窑天蓝釉鸡心盖罐', inst: '故宫博物院', era: '金', decos: ['鸡心状'], feats: ['天蓝色釉', '边缘酱黄'], cults: [], creator: '' },
  { name: '钧窑天蓝釉鼓钉三足花盆托', inst: '故宫博物院', era: '元—明初', decos: ['鼓钉纹', '云头形足'], feats: ['支钉痕', '底刻标记'], cults: ['宫廷用瓷', '清宫款识'], creator: '' },
  { name: '钧窑天蓝釉紫红斑菊瓣盘', inst: '故宫博物院', era: '元', decos: ['菊瓣形', '玫瑰紫斑块'], feats: ['天蓝色釉'], cults: ['工细之作'], creator: '' },
  { name: '钧窑天蓝釉三足炉2', inst: '故宫博物院', era: '金', decos: [], feats: ['满釉/半釉结合'], cults: ['日用陈设'], creator: '' },
  { name: '钧窑玫瑰紫釉渣斗式花盆', inst: '故宫博物院', era: '宋', decos: ['渣斗形'], feats: ['窑变釉', '底刻数目字'], cults: ['宫廷陈设瓷'], creator: '' },
  { name: '钧窑天蓝釉玉壶春瓶', inst: '故宫博物院', era: '金', decos: ['玉壶春造型'], feats: ['天蓝色釉'], cults: ['民窑日用瓷'], creator: '' },
  { name: '钧窑玫瑰紫釉鼓钉三足洗', inst: '故宫博物院', era: '时代不详', decos: ['鼓钉纹', '如意头足'], feats: ['底刷护胎釉', '底刻数目字'], cults: ['清宫刻款', '传世钧瓷'], creator: '' },
  { name: '钧窑天蓝釉三足筒式炉', inst: '故宫博物院', era: '北宋—金', decos: ['蚯蚓走泥纹'], feats: ['天蓝色釉', '素烧后上釉'], cults: [], creator: '' },
  { name: '钧窑玫瑰紫釉鼓钉三足花盆托2', inst: '故宫博物院', era: '宋', decos: ['鼓钉纹', '如意头形足'], feats: ['底刻数目字'], cults: ['皇家园林用瓷'], creator: '' },
  { name: '钧窑玫瑰紫釉菱花式花盆', inst: '故宫博物院', era: '北宋', decos: ['十二瓣菱花式'], feats: ['玫瑰紫色釉', '底刻数目字'], cults: ['宫中陈设瓷'], creator: '' },
  { name: '钧窑玫瑰紫釉海棠式花盆', inst: '故宫博物院', era: '北宋', decos: ['海棠式', '蚯蚓走泥纹'], feats: ['窑变釉', '底刻数目字'], cults: ['清代宫廷刻字'], creator: '' },
  { name: '钧窑月白釉鼓钉三足花盆托', inst: '故宫博物院', era: '北宋', decos: ['鼓钉纹'], feats: ['月白色釉', '底刻数目字', '密集支钉'], cults: ['清宫刻字'], creator: '' },
  { name: '钧窑玫瑰紫釉海棠式花盆2', inst: '故宫博物院', era: '北宋', decos: ['海棠花形'], feats: ['玫瑰紫窑变', '底刻数目字'], cults: ['清宫刻字'], creator: '' },
  { name: '钧窑豆绿釉龙首梅花杯', inst: '禹州钧官窑址博物馆', era: '北宋', decos: ['梅花造型', '龙首把'], feats: ['豆绿釉'], cults: ['茶具'], creator: '' },
  { name: '钧窑豆青釉龙首八方杯', inst: '禹州钧官窑址博物馆', era: '北宋', decos: ['八角形', '龙首柄'], feats: ['豆青釉'], cults: ['茶具珍品'], creator: '' },
  { name: '钧窑里蓝外红碗', inst: '禹州钧官窑址博物馆', era: '金代', decos: [], feats: ['里蓝外红', '铜红釉', '窑变红斑'], cults: ['小巧精致'], creator: '' },
  { name: '钧窑月白釉三足炉', inst: '禹州钧官窑址博物馆', era: '北宋', decos: ['如意状足'], feats: ['天蓝釉'], cults: ['宋钧优秀作品'], creator: '' },
  { name: '象鼻瓶', inst: '禹州钧官窑址博物馆', era: '当代', decos: ['象鼻造型'], feats: ['窑变多彩', '厚釉'], cults: [], creator: '' },
  { name: '太极', inst: '禹州钧官窑址博物馆', era: '当代', decos: [], feats: ['泥条盘筑法', '自然窑变'], cults: ['太极哲学思想'], creator: '张金伟' },
  { name: '吉祥尊', inst: '禹州钧官窑址博物馆', era: '当代', decos: ['珍珠点', '鱼子纹'], feats: ['紫红拉丝', '五彩渗透'], cults: [], creator: '杨志' },
  { name: '谷穗瓶', inst: '禹州钧官窑址博物馆', era: '60年代', decos: [], feats: ['天空之蓝'], cults: [], creator: '张金伟' },
  { name: '天池印象', inst: '禹州钧官窑址博物馆', era: '当代', decos: [], feats: ['内部曲面'], cults: ['意境悠远'], creator: '刘志军' },
  { name: '深腹钵', inst: '禹州钧官窑址博物馆', era: '当代', decos: [], feats: ['铜口铁足', '芝麻酱底', '煤烧'], cults: [], creator: '孔相卿' },
  { name: '钧窑葵花尊', inst: '禹州钧官窑址博物馆', era: '当代', decos: ['葵花造型'], feats: ['柴烧小风箱窑', '乳光莹润'], cults: [], creator: '孔家钧窑' },
  { name: '羊头罐', inst: '禹州钧官窑址博物馆', era: '当代', decos: [], feats: ['红霞似雨'], cults: ['型为本釉为魂'], creator: '刘富安' },
  { name: '印花加彩钧瓷盘', inst: '禹州钧官窑址博物馆', era: '金代', decos: ['轮花', '模印大花', '缠枝'], feats: ['天青釉', '紫色斑块'], cults: ['民窑上乘之作'], creator: '' },
  { name: '赤脚医生', inst: '禹州钧官窑址博物馆', era: '70年代', decos: [], feats: [], cults: ['时代背景', '政治特征'], creator: '仝黎明' }
];

RAW_ITEMS.forEach((item, i) => {
  const iid = `item_${i}`;
  const displayName = item.name.replace(/\d+$/, ''); // 去除同名藏品的数字后缀
  addNode({ id: iid, name: displayName, category: 'Item', symbolSize: 55, description: `详情请见原表格记录。` });

  // 1. 挂载到馆藏中心
  const instNode = MOCK_NODES.find(n => n.name === item.inst);
  if (instNode) addEdge(instNode.id, iid, '馆藏');

  // 2. 生成专属折叠属性 (Era)
  if (item.era) {
    const eraId = `${iid}_era`;
    addNode({ id: eraId, parentId: iid, name: item.era, category: 'Era', symbolSize: 35 });
    addEdge(iid, eraId, '属于时代');
  }

  // 3. 生成专属折叠属性 (Decoration 纹饰)
  item.decos.forEach((deco, idx) => {
    const decoId = `${iid}_deco_${idx}`;
    addNode({ id: decoId, parentId: iid, name: deco, category: 'Decoration', symbolSize: 35 });
    addEdge(iid, decoId, '纹饰');
  });

  // 4. 生成专属折叠属性 (Feature 工艺特征)
  item.feats.forEach((feat, idx) => {
    const featId = `${iid}_feat_${idx}`;
    addNode({ id: featId, parentId: iid, name: feat, category: 'Feature', symbolSize: 35 });
    addEdge(iid, featId, '工艺');
  });

  // 5. 生成专属折叠属性 (Culture 文化标签)
  item.cults.forEach((cult, idx) => {
    const cultId = `${iid}_cult_${idx}`;
    addNode({ id: cultId, parentId: iid, name: cult, category: 'Culture', symbolSize: 35 });
    addEdge(iid, cultId, '文化标签');
  });

  // 6. 关联人物创作者
  if (item.creator) {
    const cid = `person_${item.creator}`;
    addNode({ id: cid, name: item.creator, category: 'Person', symbolSize: 45, description: '创作者 / 收藏家' });
    addEdge(cid, iid, '创作/持有');
  }
});

// 通用 BFS 寻路算法
export const findShortestPath = (sourceId: string, targetId: string): string[] | null => {
  const startStr = String(sourceId); const endStr = String(targetId);
  if (startStr === endStr) return [startStr];
  const adjList: Record<string, string[]> = {};
  MOCK_NODES.forEach(n => adjList[String(n.id)] = []);
  MOCK_EDGES.forEach(e => {
    const src = String(e.source); const tgt = String(e.target);
    if (!adjList[src]) adjList[src] = []; if (!adjList[tgt]) adjList[tgt] = [];
    adjList[src].push(tgt); adjList[tgt].push(src); 
  });
  const queue: string[] = [startStr]; const visited = new Set<string>([startStr]); const parent: Record<string, string> = {};
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endStr) {
      const path = []; let curr = endStr;
      while (curr) { path.unshift(curr); curr = parent[curr]; }
      return path;
    }
    const neighbors = adjList[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) { visited.add(neighbor); parent[neighbor] = current; queue.push(neighbor); }
    }
  }
  return null;
};