# DTOs and validation

## Global ValidationPipe

Configured in `apps/api/src/main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
)
```

- **whitelist** — strips unknown properties from body
- **transform** — coerces types when possible
- **forbidNonWhitelisted** — rejects unknown keys with 400

## Naming convention

`VerbNounDto`: `PushKbDto`, `PublishSkillDto`, `UpdateKbDto`

## Example DTO

```typescript
import { IsString, IsOptional, IsArray } from 'class-validator'

export class PushKbDto {
  @IsString()
  title: string

  @IsString()
  content: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsString()
  project?: string
}
```

## Query parameters

Query params arrive as strings. Either parse in the controller:

```typescript
list(@Query('page') page?: string) {
  const p = page ? parseInt(page, 10) : 1
}
```

Or use `@Type(() => Number)` with `class-transformer` on a query DTO class.

## Common decorators

| Decorator | Use |
|-----------|-----|
| `@IsString()` | Text fields |
| `@IsOptional()` | Omit-able fields |
| `@IsArray()` + `@IsString({ each: true })` | Tag lists |
| `@IsEnum()` | Fixed set of values |
| `@Min()`, `@Max()` | Numeric bounds |
