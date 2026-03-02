---
name: aibase-daily-ai-news-summary-skill
description: 用于采集 AI Base 网站(https://news.aibase.com/zh/daily)的每日AI新闻，并将新闻内容缓存到本地JSON文件中。当需要获取最新AI新闻日报内容时使用此skill。
---

# AI Base 每日新闻采集 Skill

## 概述

本 Skill 用于自动采集 [AI Base](https://news.aibase.com/zh/daily) 网站的每日 AI 新闻日报，将新闻标题、摘要、发布时间、正文内容等信息缓存到本地 JSON 文件中，并提供读取和管理缓存的功能。

## 使用场景

- **定时采集**：每日定时运行采集脚本，获取最新的 AI 新闻
- **内容管理**：通过标记 `isUsed` 字段来管理已使用和未使用的新闻
- **数据集成**：在其他应用中读取缓存的 JSON 文件，使用新闻内容

## 核心功能

### 功能1：采集新闻 (`scripts/collect_news.py`)

采集新闻列表页和详情页内容，更新本地缓存。

**执行脚本：**

```bash
python scripts/collect_news.py
```

**采集逻辑：**

1. 访问 `https://news.aibase.com/zh/daily` 获取新闻列表
2. 检查最新一条新闻是否已在本地缓存中
3. 如果已存在 → 输出 `[OK] 最新新闻已在缓存中，无需更新` 并结束
4. 如果不存在 → 采集所有新闻详情并更新整个缓存文件

**缓存文件格式** (`assets/news_cache.json`)：

```json
[
  {
    "url": "https://news.aibase.com/zh/news/25709",
    "title": "新闻标题",
    "summary": "摘要（前200字）...",
    "publishTime": "2026年2月26号 13:48",
    "content": "完整正文内容...",
    "isUsed": false
  }
]
```

### 功能2：读取和管理缓存 (`scripts/news_reader.py`)

提供命令行工具来读取和管理新闻缓存。

**列出所有新闻：**

```bash
python scripts/news_reader.py list
```

**获取第一个未使用的新闻：**

```bash
python scripts/news_reader.py get
```

**标记新闻为已使用：**

```bash
# 标记第一个未使用的新闻
python scripts/news_reader.py mark

# 标记指定URL的新闻
python scripts/news_reader.py mark "https://news.aibase.com/zh/news/25709"
```

**重置所有新闻状态：**

```bash
python scripts/news_reader.py reset
```

**显示统计信息：**

```bash
python scripts/news_reader.py stats
```

## 工作流程

### 首次使用

1. 运行采集脚本获取新闻数据：
   ```bash
   python scripts/collect_news.py
   ```

2. 查看采集结果：
   ```bash
   python scripts/news_reader.py list
   ```

### 日常使用

1. **定时采集**：设置定时任务（如每天上午9点）运行采集脚本
   ```bash
   python scripts/collect_news.py
   ```

2. **获取未使用的新闻**：
   ```bash
   python scripts/news_reader.py get
   ```

3. **使用后标记**：
   ```bash
   python scripts/news_reader.py mark
   ```

### 在其他应用中读取缓存

缓存文件为标准 JSON 格式，可直接读取：

```python
import json

# 读取缓存文件
with open('assets/news_cache.json', 'r', encoding='utf-8') as f:
    news_list = json.load(f)

# 获取第一个未使用的新闻
for news in news_list:
    if not news.get('isUsed', False):
        print(f"标题: {news['title']}")
        print(f"内容: {news['content']}")
        # 标记为已使用
        news['isUsed'] = True
        break

# 保存更新后的缓存
with open('assets/news_cache.json', 'w', encoding='utf-8') as f:
    json.dump(news_list, f, ensure_ascii=False, indent=2)
```

## 依赖安装

本 Skill 需要以下 Python 依赖包：

```bash
pip install requests beautifulsoup4
```

或使用 uv：

```bash
uv add requests beautifulsoup4
```

## 注意事项

1. **网络依赖**：采集脚本需要访问 `news.aibase.com`，请确保网络连接正常
2. **反爬虫**：脚本已设置合理的 User-Agent，但请勿过于频繁地请求
3. **缓存位置**：缓存文件默认保存在 `assets/news_cache.json`
4. **编码问题**：Windows 终端可能存在编码问题，脚本已自动处理

## 最佳实践

1. **定时采集**：建议每天运行一次采集脚本，获取最新新闻
2. **按需标记**：使用新闻后及时标记 `isUsed`，避免重复使用
3. **定期清理**：缓存文件会持续增长，建议定期清理旧数据
4. **错误处理**：采集失败时会输出错误信息，可查看后重试

## 文件结构

```
aibase-daily-ai-news-summary-skill/
├── SKILL.md                    # 本文件
├── README-使用说明.md           # 使用说明
├── scripts/
│   ├── collect_news.py         # 新闻采集脚本
│   └── news_reader.py          # 缓存读取管理脚本
└── assets/
    └── news_cache.json         # 新闻缓存文件（运行时生成）
```
