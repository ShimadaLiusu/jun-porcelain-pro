import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { MOCK_NODES, MOCK_EDGES, CATEGORY_COLORS, CATEGORY_LABELS } from './data';
import './App.css';

const App = () => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [filterCat, setFilterCat] = useState<string>('All');
  
  const [pathStart, setPathStart] = useState('');
  const [pathEnd, setPathEnd] = useState('');

  // 🛑 终极 BFS 算法核心（强制将所有 ID 转换为 String 处理，解决数字类型冲突）
  const bfsResult = useMemo(() => {
    if (!pathStart) return { reachable: new Set<string>(), parents: {} };

    const startStr = String(pathStart);
    const adj: Record<string, string[]> = {};
    
    // 初始化邻接表
    MOCK_NODES.forEach(n => adj[String(n.id)] = []);
    MOCK_EDGES.forEach(e => {
      const src = String(e.source);
      const tgt = String(e.target);
      if (!adj[src]) adj[src] = [];
      if (!adj[tgt]) adj[tgt] = [];
      adj[src].push(tgt);
      adj[tgt].push(src); // 无向图
    });

    const visited = new Set<string>();
    const parents: Record<string, string> = {};
    const queue: string[] = [startStr];
    visited.add(startStr);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = adj[curr] || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parents[neighbor] = curr;
          queue.push(neighbor);
        }
      }
    }
    
    return { reachable: visited, parents };
  }, [pathStart]); // 只要起点一变，瞬间算出所有可达节点和路径树

  // --- 路径文字渲染 ---
  const pathRoute = useMemo(() => {
    if (!pathStart || !pathEnd) return null;
    const endStr = String(pathEnd);
    
    // 如果终点根本不在可达集合里
    if (!bfsResult.reachable.has(endStr)) return "暂无关联路径";

    // 回溯寻找最短路径
    const pathIds: string[] = [];
    let curr = endStr;
    while (curr) {
      pathIds.unshift(curr);
      curr = bfsResult.parents[curr];
    }

    // 将 ID 转化为中文名称显示
    return pathIds.map(id => {
      const node = MOCK_NODES.find(n => String(n.id) === id);
      return node ? node.name : id;
    }).join(' → ');
  }, [pathStart, pathEnd, bfsResult]);

  // --- 图谱过滤逻辑 ---
  // --- 图谱过滤逻辑 ---
  const filteredNodes = useMemo(() => {
    return MOCK_NODES.filter(node => {
      const matchSearch = node.name.includes(searchKey);
      const matchCat = filterCat === 'All' || node.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [searchKey, filterCat]);

  // 🛑 新增：必须同步过滤连线！只有两端节点都存在的连线，才允许渲染
  const filteredEdges = useMemo(() => {
    const validNodeIds = new Set(filteredNodes.map(n => String(n.id)));
    return MOCK_EDGES.filter(edge => 
      validNodeIds.has(String(edge.source)) && validNodeIds.has(String(edge.target))
    );
  }, [filteredNodes]);

  const selectedNode = MOCK_NODES.find(n => String(n.id) === String(activeNodeId));

  const getOption = () => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: {
      show: true,
      top: 60,
      textStyle: { color: '#adbac7' },
      data: Object.values(CATEGORY_LABELS)
    },
    series: [{
      type: 'graph',
      layout: 'force',
      categories: Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        name: label,
        itemStyle: { color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }
      })),
      data: filteredNodes.map(node => ({
        id: String(node.id),
        name: node.name,
        category: CATEGORY_LABELS[node.category],
        symbolSize: node.symbolSize || 45,
        label: { show: true, fontSize: 16, color: '#fff', position: 'right' }
      })),
      links: filteredEdges.map(edge => ({
        source: String(edge.source),
        target: String(edge.target),
        label: { 
          show: true, 
          formatter: edge.label, 
          fontSize: 12,            // 稍微放大一点点
          color: '#ffffff',        // 变成纯白色！
          textBorderColor: '#0d1117', // 加上深色背景同款描边
          textBorderWidth: 2,      // 描边宽度
          fontWeight: 'bold'       // 加粗显示
        },
        lineStyle: { 
          color: 'rgba(173, 186, 199, 0.4)', // 稍微调亮了一点连线本身
          curveness: 0.1, 
          width: 2 
        }
      })),
      force: { repulsion: 1800, edgeLength: 180, gravity: 0.1 },
      roam: true,
      draggable: true,
      focusNodeAdjacency: true,
    }]
  });

  return (
    <div className="app-wrapper">
      <header className="glass-header">
        <div className="header-left">
          <span className="logo">钧瓷知识图谱</span>
          <input className="search-input" placeholder="🔍 搜索名称..." onChange={e => setSearchKey(e.target.value)} />
          <select className="cat-select" onChange={e => setFilterCat(e.target.value)}>
            <option value="All">全部类别</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </header>

      <main className="main-layout">
        <section className="graph-viewport">
          <ReactECharts option={getOption()} style={{ height: '100%' }} onEvents={{
            click: (p: any) => {
              if (p.dataType === 'node') {
                setActiveNodeId(String(p.data.id));
                setImgError(false); // 🛑 每次点击新节点，重置图片报错状态
              }
            }
          }} />
        </section>

        <aside className="info-sidebar">
          <div className="tool-box">
            <h4>路径查询</h4>
            <label>起点：</label>
            <select value={pathStart} onChange={e => { setPathStart(e.target.value); setPathEnd(''); }}>
              <option value="">请选择起点...</option>
              {MOCK_NODES.map(n => <option key={n.id} value={String(n.id)}>{n.name}</option>)}
            </select>
            
            <label style={{marginTop: '10px', display: 'block'}}>终点：</label>
            <select value={pathEnd} onChange={e => setPathEnd(e.target.value)} disabled={!pathStart}>
              <option value="">{pathStart ? "请选择可达终点..." : "请先选择起点"}</option>
              {MOCK_NODES.map(n => {
                const nIdStr = String(n.id);
                // 直接使用同一个算法算出的 reachable 集合进行判断
                const isReachable = bfsResult.reachable.has(nIdStr) && nIdStr !== String(pathStart);
                return (
                  <option 
                    key={nIdStr} 
                    value={nIdStr} 
                    disabled={!isReachable}
                    style={{ 
                      color: isReachable ? '#58a6ff' : '#666',
                      backgroundColor: isReachable ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                      fontWeight: isReachable ? 'bold' : 'normal'
                    }}
                  >
                    {isReachable ? `✅ ${n.name}` : `❌ ${n.name}`}
                  </option>
                );
              })}
            </select>
            
            {pathRoute && (
              <div className="path-msg" style={{marginTop:'15px'}}>
                🔍 路径轨迹：<br/>
                <span style={{color: '#fff', lineHeight:'1.5'}}>{pathRoute}</span>
              </div>
            )}
          </div>

          {selectedNode ? (
            <div className="detail-card">
              
              {/* 🛑 核心修改：增加了 key，并修改了 onError 逻辑 */}
              <div className="node-image-container" key={`img-box-${selectedNode.id}`}>
                <img 
                  src={`/img/${selectedNode.name}.png`} 
                  alt={selectedNode.name} 
                  onError={(e: any) => {
                    // 如果找不到对应的图片文件，直接把整个图片框设为隐藏！
                    e.target.parentElement.style.display = 'none';
                  }} 
                />
              </div>

              <span className="category-badge" style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] }}>
                {CATEGORY_LABELS[selectedNode.category]}
              </span>
              <h2 className="node-name">{selectedNode.name}</h2>
              <p className="node-desc">
                {selectedNode.description || (selectedNode as any).desc || (selectedNode as any).info || '该节点暂无详细文字记载，请检查数据源。'}
              </p>
            </div>
          ) : <div className="empty-tip">点击节点探索详情</div>}
        </aside>
      </main>
    </div>
  );
};

export default App;