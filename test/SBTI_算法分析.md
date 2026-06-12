# SBTI 人格测试 - 完整算法与规则分析

> 原站: https://sbti.fancc.de5.net/  
> 作者: B站UP主 蛆肉儿串儿（UID417038183）

---

## 一、整体架构

SBTI 是一个仿 MBTI 的娱乐性人格测试，全称可理解为 "Shit-Based Type Indicator"（愤世型人格指标，玩笑命名）。

- **30 道常规题** + **1 道隐藏触发题**（酒鬼彩蛋）+ **1 道前置门控题**
- **5 大模型 x 3 子维度 = 15 个维度**
- 每题 3 个选项，分值 1/2/3
- 每维度 2 道题，维度总分范围 2~6
- **25 个常规人格类型** + **1 个隐藏类型（DRUNK 酒鬼）** + **1 个兜底类型（HHHH 傻乐者）**

---

## 二、五大模型与 15 维度

| 模型 | 维度代码 | 维度名称 | 含义 |
|------|---------|---------|------|
| **自我模型 (S)** | S1 | 自尊自信 | 对自身价值的认可程度 |
| | S2 | 自我清晰度 | 是否清楚自己是谁、追求什么 |
| | S3 | 核心价值 | 是否有强烈的上进心和目标感 |
| **情感模型 (E)** | E1 | 依恋安全感 | 感情中的安全感与信任度 |
| | E2 | 情感投入度 | 对待感情的认真/克制程度 |
| | E3 | 边界与依赖 | 亲密关系中的独立性偏好 |
| **态度模型 (A)** | A1 | 世界观倾向 | 对世界/人性的乐观或悲观 |
| | A2 | 规则与灵活度 | 守规矩 vs 打破常规 |
| | A3 | 人生意义感 | 是否认为人生有目标和意义 |
| **行动驱力模型 (Ac)** | Ac1 | 动机导向 | 趋近成就 vs 回避风险 |
| | Ac2 | 决策风格 | 直觉冲动型 vs 深思型 |
| | Ac3 | 执行模式 | 拖延型 vs 计划执行型 |
| **社交模型 (So)** | So1 | 社交主动性 | 社交场景中的主动/被动 |
| | So2 | 人际边界感 | 对人际距离的要求 |
| | So3 | 表达与真实度 | 表面表达与内心一致性 |

---

## 三、评分算法

### 3.1 维度评分

每个维度有 **2 道题**，每题选项分值为 1、2、3。  
维度原始分 = 两题分值之和（范围 2~6）。

**原始分 → 等级映射（sumToLevel）：**

| 原始分 | 等级 |
|--------|------|
| 2~3    | L（低） |
| 4      | M（中） |
| 5~6    | H（高） |

### 3.2 用户向量

15 个维度按固定顺序排列：  
`S1, S2, S3, E1, E2, E3, A1, A2, A3, Ac1, Ac2, Ac3, So1, So2, So3`

等级转数字：L=1, M=2, H=3  
用户向量 = 15 维数字向量，如 `[3,3,2,2,1,3,1,2,3,3,2,1,2,3,2]`

### 3.3 类型匹配

每个人格类型有一个 **pattern（模式向量）**，格式如 `HHH-HMH-MHH-HHH-MHM`：
- 用 `-` 分隔 5 组，每组 3 个字母，分别对应 5 大模型的 3 个子维度
- 解析后同样得到 15 维向量

**匹配计算：**

```javascript
// 对每个候选类型
for (let i = 0; i < 15; i++) {
    diff = |用户向量[i] - 类型向量[i]|
    distance += diff        // 曼哈顿距离
    if (diff === 0) exact++ // 精确命中维度数
}
similarity = max(0, round((1 - distance / 30) * 100))  // 相似度百分比
```

**排序规则（优先级从高到低）：**
1. distance 越小越好（总偏差小）
2. exact 越大越好（精确命中多）
3. similarity 越大越好

排序后的第一个类型即为 `bestNormal`（最佳匹配常规类型）。

### 3.4 特殊规则

1. **酒鬼彩蛋（DRUNK）**：如果用户在隐藏酒鬼触发题（drink_gate_q2）选了选项 2（"我习惯将白酒灌在保温杯，当白开水喝"），直接覆盖为 DRUNK 类型，匹配度 100%。
2. **兜底机制（HHHH）**：如果最佳匹配的 similarity < 60%，系统强制分配为 HHHH（傻乐者）。
3. 酒鬼触发题只在用户先选了"饮酒"爱好时才出现（两段式门控）。

---

## 四、全部 27 个人格类型

### 25 个常规类型 + 模式向量

| 代码 | 中文名 | 模式 (S1S2S3-E1E2E3-A1A2A3-Ac1Ac2Ac3-So1So2So3) |
|------|--------|-------|
| CTRL | 拿捏者 | HHH-HMH-MHH-HHH-MHM |
| ATM-er | 送钱者 | HHH-HHM-HHH-HMH-MHL |
| Dior-s | 屌丝 | MHM-MMH-MHM-HMH-LHL |
| BOSS | 领导者 | HHH-HMH-MMH-HHH-LHL |
| THAN-K | 感恩者 | MHM-HMM-HHM-MMH-MHL |
| OH-NO | 哦不人 | HHL-LMH-LHH-HHM-LHL |
| GOGO | 行者 | HHM-HMH-MMH-HHH-MHM |
| SEXY | 尤物 | HMH-HHL-HMM-HMM-HLH |
| LOVE-R | 多情者 | MLH-LHL-HLH-MLM-MLH |
| MUM | 妈妈 | MMH-MHL-HMM-LMM-HLL |
| FAKE | 伪人 | HLM-MML-MLM-MLM-HLH |
| OJBK | 无所谓人 | MMH-MMM-HML-LMM-MML |
| MALO | 吗喽 | MLH-MHM-MLH-MLH-LMH |
| JOKE-R | 小丑 | LLH-LHL-LML-LLL-MLM |
| WOC! | 握草人 | HHL-HMH-MMH-HHM-LHH |
| THIN-K | 思考者 | HHL-HMH-MLH-MHM-LHH |
| SHIT | 愤世者 | HHL-HLH-LMM-HHM-LHH |
| ZZZZ | 装死者 | MHL-MLH-LML-MML-LHM |
| POOR | 贫困者 | HHL-MLH-LMH-HHH-LHL |
| MONK | 僧人 | HHL-LLH-LLM-MML-LHM |
| IMSB | 傻者 | LLM-LMM-LLL-LLL-MLM |
| SOLO | 孤儿 | LML-LLH-LHL-LML-LHM |
| FUCK | 草者 | MLL-LHL-LLM-MLL-HLH |
| DEAD | 死者 | LLL-LLM-LML-LLL-LHM |
| IMFW | 废物 | LLH-LHL-LML-LLL-MLL |

### 2 个特殊类型

| 代码 | 中文名 | 触发条件 |
|------|--------|---------|
| DRUNK | 酒鬼 | 隐藏酒鬼门控题选择选项2 |
| HHHH | 傻乐者 | 最佳匹配相似度 < 60% 时兜底 |

---

## 五、维度等级解读示例

每个维度的 L/M/H 等级都有一段解读文字，例如：

- **S1 自尊自信**
  - L: 对自己下手比别人还狠，夸你两句你都想先验明真伪...
  - M: 自信值随天气波动，顺风能飞，逆风先缩...
  - H: 心里对自己大致有数，不太会被路人一句话打散...

- **E1 依恋安全感**
  - L: 感情里警报器灵敏，已读不回都能脑补到大结局...
  - M: 一半信任，一半试探，感情里常在心里拉锯...
  - H: 更愿意相信关系本身，不会被一点风吹草动吓散...

---

## 六、核心算法伪代码总结

```
输入: 用户对 30 道题的答案 answers{}

1. 计算维度原始分
   for each question q:
       rawScores[q.dim] += answers[q.id]

2. 原始分转等级
   for each dimension dim:
       levels[dim] = sumToLevel(rawScores[dim])
       // 2-3 → L, 4 → M, 5-6 → H

3. 构建用户向量
   userVector = [levelNum(levels[S1]), levelNum(levels[S2]), ..., levelNum(levels[So3])]
   // L=1, M=2, H=3

4. 计算与每个类型的距离
   for each type in NORMAL_TYPES:
       typeVector = parsePattern(type.pattern)  // "HHH-HMH-..." → [3,3,3,3,2,3,...]
       distance = sum(|userVector[i] - typeVector[i]|) for i=0..14
       exact = count(userVector[i] == typeVector[i])
       similarity = max(0, round((1 - distance/30) * 100))

5. 排序: distance↑, exact↓, similarity↓
   bestNormal = ranked[0]

6. 最终类型判定
   if 酒鬼触发题选了选项2:
       finalType = DRUNK
   else if bestNormal.similarity < 60:
       finalType = HHHH (傻乐者兜底)
   else:
       finalType = bestNormal

输出: finalType, similarity, 15维度详细解读
```

---

## 七、设计启示（用于星黎 AI 版本参考）

1. **维度体系**: 5 大模型 x 3 子维度 = 15 维，比 MBTI 的 4 维更丰富但每维只需 2 题（共 30 题，用户负担低）
2. **评分简洁**: 每题 3 选项（认同/中立/不认同），避免 5 级或 7 级量表的选择困难
3. **匹配算法**: 基于曼哈顿距离的向量匹配，而非 MBTI 的二分法，允许"模糊匹配"和相似度百分比
4. **趣味彩蛋**: 隐藏类型（酒鬼）和兜底类型（傻乐者）增加社交传播性
5. **题目风格**: 用网络梗、故事场景替代干巴巴的心理学量表，大幅提升参与感
6. **随机出题**: 常规题随机打乱顺序，隐藏题随机插入位置，每次测试体验不同
