# Decision tree

```
New endpoint needed?
│
├─ Mutates graph/search index?
│  └─ Yes → Service method + DTO + ApiKeyGuard (unless admin-only)
│
├─ Admin-only (keys, purge)?
│  └─ Yes → MasterGuard
│
├─ Expensive read (search, list all)?
│  └─ Yes → ApiKeyGuard + @Throttle()
│
└─ Health/public metadata?
   └─ No guard (rare) or internal network only
```

## Module placement

| Domain | Module |
|--------|--------|
| Solutions, search | `kb/` |
| Skills hub | `skill/` |
| API keys | `auth/` |
| Neo4j driver | `neo4j/` (global) |

One module per domain: `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.dto.ts`.
