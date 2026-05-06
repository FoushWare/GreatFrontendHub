# 📊 SonarQube Issues Report

> **Generated**: 2026-04-18T21:31:14.168Z  
> **Project**: `FoushWare_GreatFrontendHub`  
> **Branch**: `main`  
> **Total open issues**: **44** (fetched 44)  
> **Dashboard**: [View on SonarCloud](https://sonarcloud.io/dashboard?id=FoushWare_GreatFrontendHub)

## Summary

### By Severity

| Severity    | Count |     % |
| ----------- | ----: | ----: |
| 🟠 CRITICAL |     1 |  2.3% |
| 🟡 MAJOR    |    10 | 22.7% |
| 🔵 MINOR    |    33 | 75.0% |

### By Type

| Type          | Count |
| ------------- | ----: |
| 🧹 CODE_SMELL |    40 |
| 🐛 BUG        |     4 |

### Top 20 Files by Issue Count

| File                                                                                     | Issues |
| ---------------------------------------------------------------------------------------- | -----: |
| `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |     11 |
| `libs/utilities/src/lib/api/questions-handler.ts`                                        |      8 |
| `libs/utilities/src/lib/api/validation.ts`                                               |      7 |
| `libs/common-ui/src/admin/content-management/modals/CategoryFormModal.tsx`               |      2 |
| `libs/common-ui/src/components/ui/checkbox.tsx`                                          |      2 |
| `apps/admin/src/app/api/questions/unified/route.ts`                                      |      2 |
| `apps/website/src/app/api/questions/unified/route.ts`                                    |      2 |
| `libs/common-ui/src/admin/content-management/modals/QuestionFormModal.tsx`               |      1 |
| `apps/admin/src/app/admin/learning-cards/page.tsx`                                       |      1 |
| `apps/admin/src/app/admin/page.tsx`                                                      |      1 |
| `apps/admin/src/app/admin/problem-solving/page.tsx`                                      |      1 |
| `libs/database/src/repositories/index.ts`                                                |      1 |
| `libs/utilities/src/lib/api/environment.ts`                                              |      1 |
| `libs/utilities/src/lib/api/sanitize-server.ts`                                          |      1 |
| `apps/website/src/app/lib/network/routes/guided-learning/plan-details/[planId]/route.ts` |      1 |
| `apps/website/jest.minimal.setup.js`                                                     |      1 |
| `libs/common-ui/src/admin/editors/FrontendTaskEditor.tsx`                                |      1 |

### Top 20 Rules

| Rule                                                                             | Count |
| -------------------------------------------------------------------------------- | ----: |
| [`typescript:S6551`](https://sonarcloud.io/coding_rules?open=typescript%3AS6551) |    10 |
| [`typescript:S1874`](https://sonarcloud.io/coding_rules?open=typescript%3AS1874) |     8 |
| [`typescript:S1128`](https://sonarcloud.io/coding_rules?open=typescript%3AS1128) |     5 |
| [`typescript:S7763`](https://sonarcloud.io/coding_rules?open=typescript%3AS7763) |     4 |
| [`typescript:S3358`](https://sonarcloud.io/coding_rules?open=typescript%3AS3358) |     3 |
| [`typescript:S1082`](https://sonarcloud.io/coding_rules?open=typescript%3AS1082) |     3 |
| [`typescript:S6848`](https://sonarcloud.io/coding_rules?open=typescript%3AS6848) |     2 |
| [`typescript:S6819`](https://sonarcloud.io/coding_rules?open=typescript%3AS6819) |     2 |
| [`typescript:S6847`](https://sonarcloud.io/coding_rules?open=typescript%3AS6847) |     1 |
| [`typescript:S3863`](https://sonarcloud.io/coding_rules?open=typescript%3AS3863) |     1 |
| [`typescript:S125`](https://sonarcloud.io/coding_rules?open=typescript%3AS125)   |     1 |
| [`typescript:S6594`](https://sonarcloud.io/coding_rules?open=typescript%3AS6594) |     1 |
| [`typescript:S3776`](https://sonarcloud.io/coding_rules?open=typescript%3AS3776) |     1 |
| [`javascript:S3403`](https://sonarcloud.io/coding_rules?open=javascript%3AS3403) |     1 |
| [`typescript:S7787`](https://sonarcloud.io/coding_rules?open=typescript%3AS7787) |     1 |

---

## Detailed Issues

### 🟠 CRITICAL (1)

|   # | Type          | File                                       | Line | Message                                                                                                                                                                              | Rule               |
| --: | ------------- | ------------------------------------------ | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
|   1 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts` |  339 | [Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFQ) | `typescript:S3776` |

### 🟡 MAJOR (10)

|   # | Type          | File                                                                       | Line | Message                                                                                                                                                                                                                  | Rule               |
| --: | ------------- | -------------------------------------------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
|   1 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/CategoryFormModal.tsx` |  138 | [Extract this nested ternary operation into an independent statement.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_mcs65uEkFoONEM)                                                     | `typescript:S3358` |
|   2 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/QuestionFormModal.tsx` |   51 | [Extract this nested ternary operation into an independent statement.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qps65uEkFoONEY)                                                     | `typescript:S3358` |
|   3 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`    |  184 | [Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tab](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONET) | `typescript:S6848` |
|   4 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`    |  210 | [Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tab](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEV) | `typescript:S6848` |
|   5 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`    |  273 | [Extract this nested ternary operation into an independent statement.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEX)                                                     | `typescript:S3358` |
|   6 | 🧹 CODE_SMELL | `libs/common-ui/src/components/ui/checkbox.tsx`                            |   15 | [Non-interactive elements should not be assigned mouse or keyboard event listeners.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_xys65uEkFoONEx)                                       | `typescript:S6847` |
|   7 | 🧹 CODE_SMELL | `apps/admin/src/app/admin/learning-cards/page.tsx`                         |   87 | [Use <output> instead of the "status" role to ensure accessibility across all devices.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0Acks65uEkFoONHO)                                    | `typescript:S6819` |
|   8 | 🧹 CODE_SMELL | `apps/admin/src/app/admin/problem-solving/page.tsx`                        |  147 | [Use <output> instead of the "status" role to ensure accessibility across all devices.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0Adqs65uEkFoONHa)                                    | `typescript:S6819` |
|   9 | 🧹 CODE_SMELL | `libs/database/src/repositories/index.ts`                                  |   13 | [Remove this commented out code.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AGMs65uEkFoONGb)                                                                                          | `typescript:S125`  |
|  10 | 🐛 BUG        | `apps/website/jest.minimal.setup.js`                                       |   75 | [Remove this "!==" check; it will always be true. Did you mean to use "!="?](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0Aags65uEkFoONHG)                                               | `javascript:S3403` |

### 🔵 MINOR (33)

|   # | Type          | File                                                                                     | Line | Message                                                                                                                                                                                                                  | Rule               |
| --: | ------------- | ---------------------------------------------------------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
|   1 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |  959 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ1LIh6qPAYx8a-QfzTV)                    | `typescript:S6551` |
|   2 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |   81 | ['value' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ1LIh6qPAYx8a-QfzTT)                           | `typescript:S6551` |
|   3 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |  929 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ1LIh6qPAYx8a-QfzTU)                    | `typescript:S6551` |
|   4 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        | 1077 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ1LIh6qPAYx8a-QfzTW)                    | `typescript:S6551` |
|   5 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        | 1107 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ1LIh6qPAYx8a-QfzTX)                    | `typescript:S6551` |
|   6 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/CategoryFormModal.tsx`               |   55 | ['FormEvent' is deprecated.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_mcs65uEkFoONEL)                                                                                               | `typescript:S1874` |
|   7 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   14 | [Remove this unused import of 'Select'.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEN)                                                                                   | `typescript:S1128` |
|   8 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   15 | [Remove this unused import of 'SelectContent'.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEO)                                                                            | `typescript:S1128` |
|   9 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   16 | [Remove this unused import of 'SelectItem'.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEP)                                                                               | `typescript:S1128` |
|  10 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   17 | [Remove this unused import of 'SelectTrigger'.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEQ)                                                                            | `typescript:S1128` |
|  11 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   18 | [Remove this unused import of 'SelectValue'.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONER)                                                                              | `typescript:S1128` |
|  12 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |   77 | ['FormEvent' is deprecated.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONES)                                                                                               | `typescript:S1874` |
|  13 | 🐛 BUG        | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |  184 | [Visible, non-interactive elements with click handlers must have at least one keyboard listener.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEU)                          | `typescript:S1082` |
|  14 | 🐛 BUG        | `libs/common-ui/src/admin/content-management/modals/TopicFormModal.tsx`                  |  210 | [Visible, non-interactive elements with click handlers must have at least one keyboard listener.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_qhs65uEkFoONEW)                          | `typescript:S1082` |
|  15 | 🐛 BUG        | `libs/common-ui/src/components/ui/checkbox.tsx`                                          |   15 | [Visible, non-interactive elements with click handlers must have at least one keyboard listener.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_xys65uEkFoONEy)                          | `typescript:S1082` |
|  16 | 🧹 CODE_SMELL | `apps/admin/src/app/admin/page.tsx`                                                      |    3 | ['/home/runner/work/elzatona_web/elzatona_web/node_modules/react/index.js' imported multiple times.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0Adds65uEkFoONHY)                       | `typescript:S3863` |
|  17 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |  453 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABss65uEkFoONFf)                    | `typescript:S6551` |
|  18 | 🧹 CODE_SMELL | `apps/admin/src/app/api/questions/unified/route.ts`                                      |    6 | [Use `export…from` to re-export `GET`.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AcMs65uEkFoONHM)                                                                                    | `typescript:S7763` |
|  19 | 🧹 CODE_SMELL | `apps/admin/src/app/api/questions/unified/route.ts`                                      |    6 | [Use `export…from` to re-export `POST`.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AcMs65uEkFoONHN)                                                                                   | `typescript:S7763` |
|  20 | 🧹 CODE_SMELL | `apps/website/src/app/api/questions/unified/route.ts`                                    |    6 | [Use `export…from` to re-export `GET`.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AVXs65uEkFoONG5)                                                                                    | `typescript:S7763` |
|  21 | 🧹 CODE_SMELL | `apps/website/src/app/api/questions/unified/route.ts`                                    |    6 | [Use `export…from` to re-export `POST`.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AVXs65uEkFoONG6)                                                                                   | `typescript:S7763` |
|  22 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/environment.ts`                                              |  124 | [Use the "RegExp.exec()" method instead.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AB_s65uEkFoONGV)                                                                                  | `typescript:S6594` |
|  23 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |  428 | ['codeField' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABss65uEkFoONFe)                       | `typescript:S6551` |
|  24 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/questions-handler.ts`                                        |  542 | ['originalCode' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABss65uEkFoONFj)                    | `typescript:S6551` |
|  25 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/sanitize-server.ts`                                          |  313 | ['value' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0AB3s65uEkFoONGU)                           | `typescript:S6551` |
|  26 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |   17 | ['(params?: string \| { pattern?: RegExp \| undefined; abort?: boolean \| undefined; error?: string \| $ZodErrorMap<$ZodI](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFK) | `typescript:S1874` |
|  27 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |   54 | ['(params?: string \| { normalize?: boolean \| undefined; pattern?: RegExp \| undefined; abort?: boolean \| undefined; ho](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFL) | `typescript:S1874` |
|  28 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |   95 | ['(params?: string \| { version?: "v1" \| "v2" \| "v3" \| "v4" \| "v5" \| "v6" \| "v7" \| "v8" \| undefined; abort?: bool](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFM) | `typescript:S1874` |
|  29 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |   99 | ['(params?: string \| { version?: "v1" \| "v2" \| "v3" \| "v4" \| "v5" \| "v6" \| "v7" \| "v8" \| undefined; abort?: bool](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFN) | `typescript:S1874` |
|  30 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |  128 | ['(params?: string \| { version?: "v1" \| "v2" \| "v3" \| "v4" \| "v5" \| "v6" \| "v7" \| "v8" \| undefined; abort?: bool](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFO) | `typescript:S1874` |
|  31 | 🧹 CODE_SMELL | `libs/utilities/src/lib/api/validation.ts`                                               |  137 | ['(params?: string \| { version?: "v1" \| "v2" \| "v3" \| "v4" \| "v5" \| "v6" \| "v7" \| "v8" \| undefined; abort?: bool](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ABds65uEkFoONFP) | `typescript:S1874` |
|  32 | 🧹 CODE_SMELL | `apps/website/src/app/lib/network/routes/guided-learning/plan-details/[planId]/route.ts` | 1286 | ['hints' will use Object's default stringification format ('[object Object]') when stringified.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_0ANus65uEkFoONGu)                           | `typescript:S6551` |
|  33 | 🧹 CODE_SMELL | `libs/common-ui/src/admin/editors/FrontendTaskEditor.tsx`                                |   17 | [import statement without specifiers is not allowed.](https://sonarcloud.io/project/issues?id=FoushWare_GreatFrontendHub&open=AZ0_z_lqs65uEkFoONEK)                                                                      | `typescript:S7787` |

---

## Fix Checklist

Use this checklist to track which issues you have fixed locally before pushing:

### Priority Fixes (BLOCKER + CRITICAL)

- [ ] **libs/utilities/src/lib/api/validation.ts:339** — Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allo

> 💡 Re-run `npm run sonar:report` after fixing to refresh this report.
