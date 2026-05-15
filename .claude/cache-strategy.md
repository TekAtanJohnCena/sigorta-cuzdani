# Prompt Caching Stratejisi

## Architect Agent
**Model:** Claude Sonnet 4.6  
**Cache Strategy:**
- **Static Context (CACHE):** AGENTS.md, CLAUDE.md, memory files, project structure
- **Dynamic Input:** Yeni task description
- **Target Cache Hit Rate:** >80%
- **Estimated Token Savings:** 25K tokens/request after first run

## Developer Agent
**Model:** Claude Sonnet 4.6  
**Cache Strategy:**
- **Static Context (CACHE):** Architect plan, code style patterns, file tree
- **Dynamic Input:** Specific implementation details
- **Target Cache Hit Rate:** >70%
- **Estimated Token Savings:** 7K tokens/request after first run

## Security Auditor (Haiku)
**Model:** Claude Haiku 4.5
**Cache Strategy:**
- **Static Context (CACHE):** OWASP Top 10 checklist (opsiyonel, Haiku zaten ucuz)
- **Dynamic Input:** git diff output (her seferinde farklı)
- **Target Cache Hit Rate:** N/A (diff her seferinde yeni)
- **Cost Optimization:** Haiku kullanımı zaten 92% ucuz ($0.25/M vs $3/M)

## Beklenen Maliyet Analizi

### Önceki Yaklaşım (Monolitik Sonnet)
```
Request başına: 30,000 tokens input
Maliyet: $3 / 1M tokens
100 request: 3M tokens = $9
```

### Yeni Yaklaşım (Multi-Agent + Caching)
```
Architect (ilk run):  5,000 tokens × $3/M = $0.015
Architect (cached):     500 tokens × $3/M = $0.0015
Developer (ilk run):  8,000 tokens × $3/M = $0.024
Developer (cached):   1,000 tokens × $3/M = $0.003
Security (Haiku):     2,000 tokens × $0.25/M = $0.0005

100 request (90 cached): ~$1.2 total
TASARRUF: 87%
```

## Cache Invalidation Kuralları

Cache'i yenile eğer:
- AGENTS.md veya CLAUDE.md değişirse
- Proje yapısı (yeni klasör/dosya) değişirse
- Memory files güncellendiyse

Cache'i KORUMA:
- Sadece kod içeriği değişirse
- Test dosyaları güncellenirse
- Documentation (README vb) değişirse
