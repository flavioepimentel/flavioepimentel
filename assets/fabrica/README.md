# Banner da fábrica de dados

Desenhado com a skill [anatomy](https://github.com/wheresryan22/anatomy). Para regenerar `../fabrica-dark.svg` e `../fabrica-light.svg`, na raiz do repositório:

```powershell
docker run --rm -v "$env:USERPROFILE\.claude\skillsnatomy:/anatomy:ro" -v "${PWD}ssets:/w" -w /w node:lts node fabrica/build.mjs
```
