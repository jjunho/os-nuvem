# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comunicador-velocidade.spec.ts >> 300 mil mensagens: leitura <100 ms e entrega <300 ms
- Location: tests/e2e/comunicador-velocidade.spec.ts:5:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 100
Received:   112.86516699999993
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - link "Corealux OS" [ref=e3] [cursor=pointer]:
      - /url: /
    - navigation [ref=e4]:
      - button "Comunicador" [ref=e5] [cursor=pointer]:
        - text: Comunicador
        - generic [aria-hidden] [ref=e6]: · 199000
      - link "Pipeline" [ref=e7] [cursor=pointer]:
        - /url: /
      - link "Notificações" [ref=e8] [cursor=pointer]:
        - /url: /notificacoes
      - link "Tabelas de referência" [ref=e9] [cursor=pointer]:
        - /url: /tabelas
      - link "Quadros" [ref=e10] [cursor=pointer]:
        - /url: /quadros
      - link "Tarefas" [ref=e11] [cursor=pointer]:
        - /url: /tarefas
      - link "Nova viagem" [ref=e12] [cursor=pointer]:
        - /url: /viagens/nova
      - link "Modelos de primeira resposta" [ref=e13] [cursor=pointer]:
        - /url: /modelos-resposta
      - link "Opções conhecidas" [ref=e14] [cursor=pointer]:
        - /url: /opcoes
    - button "Buscar" [ref=e15] [cursor=pointer]: Buscar Ctrl K
    - generic [ref=e16]: Carlos
    - combobox "Idioma da interface" [ref=e18]:
      - option "Português" [selected]
      - option "한국어"
    - button "Sair" [ref=e20] [cursor=pointer]
  - region "Boas-vindas" [ref=e21]:
    - paragraph [ref=e22]: O Admin pode ler todas as conversas, inclusive as diretas.
    - button "Entendi" [ref=e23] [cursor=pointer]
  - main [ref=e24]:
    - heading "Pipeline" [level=1] [ref=e25]
    - navigation "Visualização do Pipeline" [ref=e26]:
      - link "Lista" [ref=e27] [cursor=pointer]:
        - /url: /?visualizacao=lista
      - link "Kanban" [ref=e28] [cursor=pointer]:
        - /url: /?visualizacao=kanban
    - generic [ref=e29]:
      - generic [ref=e30]:
        - text: Responsável
        - combobox "Responsável" [ref=e31]:
          - option "Todos" [selected]
          - option "Carlos"
          - option "Hyewon Ku (Helena)"
          - option "Jessica"
          - option "Lia"
          - option "Lidiane"
      - generic [ref=e32]:
        - text: Canal comercial
        - combobox "Canal comercial" [ref=e33]:
          - option "Todos" [selected]
          - option "Interep/Operadora"
          - option "Agência"
          - option "Cliente final"
          - option "Influencer"
      - generic [ref=e34]:
        - checkbox "Próxima ação atrasada" [ref=e35]
        - text: Próxima ação atrasada
      - button "Filtrar" [ref=e36] [cursor=pointer]
    - table [ref=e37]:
      - rowgroup [ref=e38]:
        - row [ref=e39]:
          - columnheader "Código" [ref=e40]
          - columnheader "Contato" [ref=e41]
          - columnheader "Etapa" [ref=e42]
          - columnheader "Canal" [ref=e43]
          - columnheader "Responsável" [ref=e44]
          - columnheader "Datas" [ref=e45]
          - columnheader "Pax" [ref=e46]
          - columnheader "Próxima ação" [ref=e47]
          - columnheader "Prazo" [ref=e48]
      - rowgroup [ref=e49]:
        - row [ref=e50]:
          - cell "Nenhuma viagem aberta." [ref=e51]
    - navigation "Páginas"
  - complementary "Comunicador" [ref=e52]:
    - generic [ref=e53]:
      - heading "Comunicador" [level=2] [ref=e54]
      - button "Fechar" [ref=e55] [cursor=pointer]
    - group [ref=e56]:
      - generic "Não perturbe" [ref=e57]
    - generic [ref=e58]:
      - text: Conversa direta
      - combobox "Conversa direta" [ref=e59]:
        - option "Escolher usuário"
        - option "Carlos"
        - option "Hyewon Ku (Helena)"
        - option "Jessica"
        - option "Lia" [selected]
        - option "Lidiane"
        - option "Usuário 1"
        - option "Usuário 10"
        - option "Usuário 11"
        - option "Usuário 12"
        - option "Usuário 13"
        - option "Usuário 14"
        - option "Usuário 15"
        - option "Usuário 16"
        - option "Usuário 17"
        - option "Usuário 18"
        - option "Usuário 19"
        - option "Usuário 2"
        - option "Usuário 20"
        - option "Usuário 21"
        - option "Usuário 22"
        - option "Usuário 23"
        - option "Usuário 24"
        - option "Usuário 25"
        - option "Usuário 26"
        - option "Usuário 27"
        - option "Usuário 28"
        - option "Usuário 29"
        - option "Usuário 3"
        - option "Usuário 30"
        - option "Usuário 4"
        - option "Usuário 5"
        - option "Usuário 6"
        - option "Usuário 7"
        - option "Usuário 8"
        - option "Usuário 9"
    - button "Iniciar conversa" [ref=e60] [cursor=pointer]
    - group [ref=e61]:
      - generic "Novo grupo" [ref=e62]
    - generic [ref=e63]:
      - checkbox "Mostrar arquivadas" [ref=e64]
      - text: Mostrar arquivadas
    - navigation:
      - button "Lia" [pressed] [ref=e65] [cursor=pointer]
      - button "Grupo 300 Não lidas" [ref=e66] [cursor=pointer]: Grupo 300 1000
      - button "Grupo 299 Não lidas" [ref=e67] [cursor=pointer]: Grupo 299 1000
      - button "Grupo 298 Não lidas" [ref=e68] [cursor=pointer]: Grupo 298 1000
      - button "Grupo 297 Não lidas" [ref=e69] [cursor=pointer]: Grupo 297 1000
      - button "Grupo 296 Não lidas" [ref=e70] [cursor=pointer]: Grupo 296 1000
      - button "Grupo 295 Não lidas" [ref=e71] [cursor=pointer]: Grupo 295 1000
      - button "Grupo 294 Não lidas" [ref=e72] [cursor=pointer]: Grupo 294 1000
      - button "Grupo 293 Não lidas" [ref=e73] [cursor=pointer]: Grupo 293 1000
      - button "Grupo 292 Não lidas" [ref=e74] [cursor=pointer]: Grupo 292 1000
      - button "Grupo 291 Não lidas" [ref=e75] [cursor=pointer]: Grupo 291 1000
      - button "Grupo 290 Não lidas" [ref=e76] [cursor=pointer]: Grupo 290 1000
      - button "Grupo 289 Não lidas" [ref=e77] [cursor=pointer]: Grupo 289 1000
      - button "Grupo 288 Não lidas" [ref=e78] [cursor=pointer]: Grupo 288 1000
      - button "Grupo 287 Não lidas" [ref=e79] [cursor=pointer]: Grupo 287 1000
      - button "Grupo 286 Não lidas" [ref=e80] [cursor=pointer]: Grupo 286 1000
      - button "Grupo 285 Não lidas" [ref=e81] [cursor=pointer]: Grupo 285 1000
      - button "Grupo 284 Não lidas" [ref=e82] [cursor=pointer]: Grupo 284 1000
      - button "Grupo 283 Não lidas" [ref=e83] [cursor=pointer]: Grupo 283 1000
      - button "Grupo 282 Não lidas" [ref=e84] [cursor=pointer]: Grupo 282 1000
      - button "Grupo 281 Não lidas" [ref=e85] [cursor=pointer]: Grupo 281 1000
      - button "Grupo 280 Não lidas" [ref=e86] [cursor=pointer]: Grupo 280 1000
      - button "Grupo 279 Não lidas" [ref=e87] [cursor=pointer]: Grupo 279 1000
      - button "Grupo 278 Não lidas" [ref=e88] [cursor=pointer]: Grupo 278 1000
      - button "Grupo 277 Não lidas" [ref=e89] [cursor=pointer]: Grupo 277 1000
      - button "Grupo 276 Não lidas" [ref=e90] [cursor=pointer]: Grupo 276 1000
      - button "Grupo 275 Não lidas" [ref=e91] [cursor=pointer]: Grupo 275 1000
      - button "Grupo 274 Não lidas" [ref=e92] [cursor=pointer]: Grupo 274 1000
      - button "Grupo 273 Não lidas" [ref=e93] [cursor=pointer]: Grupo 273 1000
      - button "Grupo 272 Não lidas" [ref=e94] [cursor=pointer]: Grupo 272 1000
      - button "Grupo 271 Não lidas" [ref=e95] [cursor=pointer]: Grupo 271 1000
      - button "Grupo 270 Não lidas" [ref=e96] [cursor=pointer]: Grupo 270 1000
      - button "Grupo 269 Não lidas" [ref=e97] [cursor=pointer]: Grupo 269 1000
      - button "Grupo 268 Não lidas" [ref=e98] [cursor=pointer]: Grupo 268 1000
      - button "Grupo 267 Não lidas" [ref=e99] [cursor=pointer]: Grupo 267 1000
      - button "Grupo 266 Não lidas" [ref=e100] [cursor=pointer]: Grupo 266 1000
      - button "Grupo 265 Não lidas" [ref=e101] [cursor=pointer]: Grupo 265 1000
      - button "Grupo 264 Não lidas" [ref=e102] [cursor=pointer]: Grupo 264 1000
      - button "Grupo 263 Não lidas" [ref=e103] [cursor=pointer]: Grupo 263 1000
      - button "Grupo 262 Não lidas" [ref=e104] [cursor=pointer]: Grupo 262 1000
      - button "Grupo 261 Não lidas" [ref=e105] [cursor=pointer]: Grupo 261 1000
      - button "Grupo 260 Não lidas" [ref=e106] [cursor=pointer]: Grupo 260 1000
      - button "Grupo 259 Não lidas" [ref=e107] [cursor=pointer]: Grupo 259 1000
      - button "Grupo 258 Não lidas" [ref=e108] [cursor=pointer]: Grupo 258 1000
      - button "Grupo 257 Não lidas" [ref=e109] [cursor=pointer]: Grupo 257 1000
      - button "Grupo 256 Não lidas" [ref=e110] [cursor=pointer]: Grupo 256 1000
      - button "Grupo 255 Não lidas" [ref=e111] [cursor=pointer]: Grupo 255 1000
      - button "Grupo 254 Não lidas" [ref=e112] [cursor=pointer]: Grupo 254 1000
      - button "Grupo 253 Não lidas" [ref=e113] [cursor=pointer]: Grupo 253 1000
      - button "Grupo 252 Não lidas" [ref=e114] [cursor=pointer]: Grupo 252 1000
      - button "Grupo 251 Não lidas" [ref=e115] [cursor=pointer]: Grupo 251 1000
      - button "Grupo 250 Não lidas" [ref=e116] [cursor=pointer]: Grupo 250 1000
      - button "Grupo 249 Não lidas" [ref=e117] [cursor=pointer]: Grupo 249 1000
      - button "Grupo 248 Não lidas" [ref=e118] [cursor=pointer]: Grupo 248 1000
      - button "Grupo 247 Não lidas" [ref=e119] [cursor=pointer]: Grupo 247 1000
      - button "Grupo 246 Não lidas" [ref=e120] [cursor=pointer]: Grupo 246 1000
      - button "Grupo 245 Não lidas" [ref=e121] [cursor=pointer]: Grupo 245 1000
      - button "Grupo 244 Não lidas" [ref=e122] [cursor=pointer]: Grupo 244 1000
      - button "Grupo 243 Não lidas" [ref=e123] [cursor=pointer]: Grupo 243 1000
      - button "Grupo 242 Não lidas" [ref=e124] [cursor=pointer]: Grupo 242 1000
      - button "Grupo 241 Não lidas" [ref=e125] [cursor=pointer]: Grupo 241 1000
      - button "Grupo 240 Não lidas" [ref=e126] [cursor=pointer]: Grupo 240 1000
      - button "Grupo 239 Não lidas" [ref=e127] [cursor=pointer]: Grupo 239 1000
      - button "Grupo 238 Não lidas" [ref=e128] [cursor=pointer]: Grupo 238 1000
      - button "Grupo 237 Não lidas" [ref=e129] [cursor=pointer]: Grupo 237 1000
      - button "Grupo 236 Não lidas" [ref=e130] [cursor=pointer]: Grupo 236 1000
      - button "Grupo 235 Não lidas" [ref=e131] [cursor=pointer]: Grupo 235 1000
      - button "Grupo 234 Não lidas" [ref=e132] [cursor=pointer]: Grupo 234 1000
      - button "Grupo 233 Não lidas" [ref=e133] [cursor=pointer]: Grupo 233 1000
      - button "Grupo 232 Não lidas" [ref=e134] [cursor=pointer]: Grupo 232 1000
      - button "Grupo 231 Não lidas" [ref=e135] [cursor=pointer]: Grupo 231 1000
      - button "Grupo 230 Não lidas" [ref=e136] [cursor=pointer]: Grupo 230 1000
      - button "Grupo 229 Não lidas" [ref=e137] [cursor=pointer]: Grupo 229 1000
      - button "Grupo 228 Não lidas" [ref=e138] [cursor=pointer]: Grupo 228 1000
      - button "Grupo 227 Não lidas" [ref=e139] [cursor=pointer]: Grupo 227 1000
      - button "Grupo 226 Não lidas" [ref=e140] [cursor=pointer]: Grupo 226 1000
      - button "Grupo 225 Não lidas" [ref=e141] [cursor=pointer]: Grupo 225 1000
      - button "Grupo 224 Não lidas" [ref=e142] [cursor=pointer]: Grupo 224 1000
      - button "Grupo 223 Não lidas" [ref=e143] [cursor=pointer]: Grupo 223 1000
      - button "Grupo 222 Não lidas" [ref=e144] [cursor=pointer]: Grupo 222 1000
      - button "Grupo 221 Não lidas" [ref=e145] [cursor=pointer]: Grupo 221 1000
      - button "Grupo 220 Não lidas" [ref=e146] [cursor=pointer]: Grupo 220 1000
      - button "Grupo 219 Não lidas" [ref=e147] [cursor=pointer]: Grupo 219 1000
      - button "Grupo 218 Não lidas" [ref=e148] [cursor=pointer]: Grupo 218 1000
      - button "Grupo 217 Não lidas" [ref=e149] [cursor=pointer]: Grupo 217 1000
      - button "Grupo 216 Não lidas" [ref=e150] [cursor=pointer]: Grupo 216 1000
      - button "Grupo 215 Não lidas" [ref=e151] [cursor=pointer]: Grupo 215 1000
      - button "Grupo 214 Não lidas" [ref=e152] [cursor=pointer]: Grupo 214 1000
      - button "Grupo 213 Não lidas" [ref=e153] [cursor=pointer]: Grupo 213 1000
      - button "Grupo 212 Não lidas" [ref=e154] [cursor=pointer]: Grupo 212 1000
      - button "Grupo 211 Não lidas" [ref=e155] [cursor=pointer]: Grupo 211 1000
      - button "Grupo 210 Não lidas" [ref=e156] [cursor=pointer]: Grupo 210 1000
      - button "Grupo 209 Não lidas" [ref=e157] [cursor=pointer]: Grupo 209 1000
      - button "Grupo 208 Não lidas" [ref=e158] [cursor=pointer]: Grupo 208 1000
      - button "Grupo 207 Não lidas" [ref=e159] [cursor=pointer]: Grupo 207 1000
      - button "Grupo 206 Não lidas" [ref=e160] [cursor=pointer]: Grupo 206 1000
      - button "Grupo 205 Não lidas" [ref=e161] [cursor=pointer]: Grupo 205 1000
      - button "Grupo 204 Não lidas" [ref=e162] [cursor=pointer]: Grupo 204 1000
      - button "Grupo 203 Não lidas" [ref=e163] [cursor=pointer]: Grupo 203 1000
      - button "Grupo 202 Não lidas" [ref=e164] [cursor=pointer]: Grupo 202 1000
      - button "Grupo 201 Não lidas" [ref=e165] [cursor=pointer]: Grupo 201 1000
      - button "Grupo 200 Não lidas" [ref=e166] [cursor=pointer]: Grupo 200 1000
      - button "Grupo 199 Não lidas" [ref=e167] [cursor=pointer]: Grupo 199 1000
      - button "Grupo 198 Não lidas" [ref=e168] [cursor=pointer]: Grupo 198 1000
      - button "Grupo 197 Não lidas" [ref=e169] [cursor=pointer]: Grupo 197 1000
      - button "Grupo 196 Não lidas" [ref=e170] [cursor=pointer]: Grupo 196 1000
      - button "Grupo 195 Não lidas" [ref=e171] [cursor=pointer]: Grupo 195 1000
      - button "Grupo 194 Não lidas" [ref=e172] [cursor=pointer]: Grupo 194 1000
      - button "Grupo 193 Não lidas" [ref=e173] [cursor=pointer]: Grupo 193 1000
      - button "Grupo 192 Não lidas" [ref=e174] [cursor=pointer]: Grupo 192 1000
      - button "Grupo 191 Não lidas" [ref=e175] [cursor=pointer]: Grupo 191 1000
      - button "Grupo 190 Não lidas" [ref=e176] [cursor=pointer]: Grupo 190 1000
      - button "Grupo 189 Não lidas" [ref=e177] [cursor=pointer]: Grupo 189 1000
      - button "Grupo 188 Não lidas" [ref=e178] [cursor=pointer]: Grupo 188 1000
      - button "Grupo 187 Não lidas" [ref=e179] [cursor=pointer]: Grupo 187 1000
      - button "Grupo 186 Não lidas" [ref=e180] [cursor=pointer]: Grupo 186 1000
      - button "Grupo 185 Não lidas" [ref=e181] [cursor=pointer]: Grupo 185 1000
      - button "Grupo 184 Não lidas" [ref=e182] [cursor=pointer]: Grupo 184 1000
      - button "Grupo 183 Não lidas" [ref=e183] [cursor=pointer]: Grupo 183 1000
      - button "Grupo 182 Não lidas" [ref=e184] [cursor=pointer]: Grupo 182 1000
      - button "Grupo 181 Não lidas" [ref=e185] [cursor=pointer]: Grupo 181 1000
      - button "Grupo 180 Não lidas" [ref=e186] [cursor=pointer]: Grupo 180 1000
      - button "Grupo 179 Não lidas" [ref=e187] [cursor=pointer]: Grupo 179 1000
      - button "Grupo 178 Não lidas" [ref=e188] [cursor=pointer]: Grupo 178 1000
      - button "Grupo 177 Não lidas" [ref=e189] [cursor=pointer]: Grupo 177 1000
      - button "Grupo 176 Não lidas" [ref=e190] [cursor=pointer]: Grupo 176 1000
      - button "Grupo 175 Não lidas" [ref=e191] [cursor=pointer]: Grupo 175 1000
      - button "Grupo 174 Não lidas" [ref=e192] [cursor=pointer]: Grupo 174 1000
      - button "Grupo 173 Não lidas" [ref=e193] [cursor=pointer]: Grupo 173 1000
      - button "Grupo 172 Não lidas" [ref=e194] [cursor=pointer]: Grupo 172 1000
      - button "Grupo 171 Não lidas" [ref=e195] [cursor=pointer]: Grupo 171 1000
      - button "Grupo 170 Não lidas" [ref=e196] [cursor=pointer]: Grupo 170 1000
      - button "Grupo 169 Não lidas" [ref=e197] [cursor=pointer]: Grupo 169 1000
      - button "Grupo 168 Não lidas" [ref=e198] [cursor=pointer]: Grupo 168 1000
      - button "Grupo 167 Não lidas" [ref=e199] [cursor=pointer]: Grupo 167 1000
      - button "Grupo 166 Não lidas" [ref=e200] [cursor=pointer]: Grupo 166 1000
      - button "Grupo 165 Não lidas" [ref=e201] [cursor=pointer]: Grupo 165 1000
      - button "Grupo 164 Não lidas" [ref=e202] [cursor=pointer]: Grupo 164 1000
      - button "Grupo 163 Não lidas" [ref=e203] [cursor=pointer]: Grupo 163 1000
      - button "Grupo 162 Não lidas" [ref=e204] [cursor=pointer]: Grupo 162 1000
      - button "Grupo 161 Não lidas" [ref=e205] [cursor=pointer]: Grupo 161 1000
      - button "Grupo 160 Não lidas" [ref=e206] [cursor=pointer]: Grupo 160 1000
      - button "Grupo 159 Não lidas" [ref=e207] [cursor=pointer]: Grupo 159 1000
      - button "Grupo 158 Não lidas" [ref=e208] [cursor=pointer]: Grupo 158 1000
      - button "Grupo 157 Não lidas" [ref=e209] [cursor=pointer]: Grupo 157 1000
      - button "Grupo 156 Não lidas" [ref=e210] [cursor=pointer]: Grupo 156 1000
      - button "Grupo 155 Não lidas" [ref=e211] [cursor=pointer]: Grupo 155 1000
      - button "Grupo 154 Não lidas" [ref=e212] [cursor=pointer]: Grupo 154 1000
      - button "Grupo 153 Não lidas" [ref=e213] [cursor=pointer]: Grupo 153 1000
      - button "Grupo 152 Não lidas" [ref=e214] [cursor=pointer]: Grupo 152 1000
      - button "Grupo 151 Não lidas" [ref=e215] [cursor=pointer]: Grupo 151 1000
      - button "Grupo 150 Não lidas" [ref=e216] [cursor=pointer]: Grupo 150 1000
      - button "Grupo 149 Não lidas" [ref=e217] [cursor=pointer]: Grupo 149 1000
      - button "Grupo 148 Não lidas" [ref=e218] [cursor=pointer]: Grupo 148 1000
      - button "Grupo 147 Não lidas" [ref=e219] [cursor=pointer]: Grupo 147 1000
      - button "Grupo 146 Não lidas" [ref=e220] [cursor=pointer]: Grupo 146 1000
      - button "Grupo 145 Não lidas" [ref=e221] [cursor=pointer]: Grupo 145 1000
      - button "Grupo 144 Não lidas" [ref=e222] [cursor=pointer]: Grupo 144 1000
      - button "Grupo 143 Não lidas" [ref=e223] [cursor=pointer]: Grupo 143 1000
      - button "Grupo 142 Não lidas" [ref=e224] [cursor=pointer]: Grupo 142 1000
      - button "Grupo 141 Não lidas" [ref=e225] [cursor=pointer]: Grupo 141 1000
      - button "Grupo 140 Não lidas" [ref=e226] [cursor=pointer]: Grupo 140 1000
      - button "Grupo 139 Não lidas" [ref=e227] [cursor=pointer]: Grupo 139 1000
      - button "Grupo 138 Não lidas" [ref=e228] [cursor=pointer]: Grupo 138 1000
      - button "Grupo 137 Não lidas" [ref=e229] [cursor=pointer]: Grupo 137 1000
      - button "Grupo 136 Não lidas" [ref=e230] [cursor=pointer]: Grupo 136 1000
      - button "Grupo 135 Não lidas" [ref=e231] [cursor=pointer]: Grupo 135 1000
      - button "Grupo 134 Não lidas" [ref=e232] [cursor=pointer]: Grupo 134 1000
      - button "Grupo 133 Não lidas" [ref=e233] [cursor=pointer]: Grupo 133 1000
      - button "Grupo 132 Não lidas" [ref=e234] [cursor=pointer]: Grupo 132 1000
      - button "Grupo 131 Não lidas" [ref=e235] [cursor=pointer]: Grupo 131 1000
      - button "Grupo 130 Não lidas" [ref=e236] [cursor=pointer]: Grupo 130 1000
      - button "Grupo 129 Não lidas" [ref=e237] [cursor=pointer]: Grupo 129 1000
      - button "Grupo 128 Não lidas" [ref=e238] [cursor=pointer]: Grupo 128 1000
      - button "Grupo 127 Não lidas" [ref=e239] [cursor=pointer]: Grupo 127 1000
      - button "Grupo 126 Não lidas" [ref=e240] [cursor=pointer]: Grupo 126 1000
      - button "Grupo 125 Não lidas" [ref=e241] [cursor=pointer]: Grupo 125 1000
      - button "Grupo 124 Não lidas" [ref=e242] [cursor=pointer]: Grupo 124 1000
      - button "Grupo 123 Não lidas" [ref=e243] [cursor=pointer]: Grupo 123 1000
      - button "Grupo 122 Não lidas" [ref=e244] [cursor=pointer]: Grupo 122 1000
      - button "Grupo 121 Não lidas" [ref=e245] [cursor=pointer]: Grupo 121 1000
      - button "Grupo 120 Não lidas" [ref=e246] [cursor=pointer]: Grupo 120 1000
      - button "Grupo 119 Não lidas" [ref=e247] [cursor=pointer]: Grupo 119 1000
      - button "Grupo 118 Não lidas" [ref=e248] [cursor=pointer]: Grupo 118 1000
      - button "Grupo 117 Não lidas" [ref=e249] [cursor=pointer]: Grupo 117 1000
      - button "Grupo 116 Não lidas" [ref=e250] [cursor=pointer]: Grupo 116 1000
      - button "Grupo 115 Não lidas" [ref=e251] [cursor=pointer]: Grupo 115 1000
      - button "Grupo 114 Não lidas" [ref=e252] [cursor=pointer]: Grupo 114 1000
      - button "Grupo 113 Não lidas" [ref=e253] [cursor=pointer]: Grupo 113 1000
      - button "Grupo 112 Não lidas" [ref=e254] [cursor=pointer]: Grupo 112 1000
      - button "Grupo 111 Não lidas" [ref=e255] [cursor=pointer]: Grupo 111 1000
      - button "Grupo 110 Não lidas" [ref=e256] [cursor=pointer]: Grupo 110 1000
      - button "Grupo 109 Não lidas" [ref=e257] [cursor=pointer]: Grupo 109 1000
      - button "Grupo 108 Não lidas" [ref=e258] [cursor=pointer]: Grupo 108 1000
      - button "Grupo 107 Não lidas" [ref=e259] [cursor=pointer]: Grupo 107 1000
      - button "Grupo 106 Não lidas" [ref=e260] [cursor=pointer]: Grupo 106 1000
      - button "Grupo 105 Não lidas" [ref=e261] [cursor=pointer]: Grupo 105 1000
      - button "Grupo 104 Não lidas" [ref=e262] [cursor=pointer]: Grupo 104 1000
      - button "Grupo 103 Não lidas" [ref=e263] [cursor=pointer]: Grupo 103 1000
      - button "Grupo 102 Não lidas" [ref=e264] [cursor=pointer]: Grupo 102 1000
    - group [ref=e265]:
      - generic "Buscar mensagens" [ref=e266]
      - option "Autor" [selected]
      - option "Carlos"
      - option "Hyewon Ku (Helena)"
      - option "Jessica"
      - option "Lia"
      - option "Lidiane"
      - option "Usuário 1"
      - option "Usuário 10"
      - option "Usuário 11"
      - option "Usuário 12"
      - option "Usuário 13"
      - option "Usuário 14"
      - option "Usuário 15"
      - option "Usuário 16"
      - option "Usuário 17"
      - option "Usuário 18"
      - option "Usuário 19"
      - option "Usuário 2"
      - option "Usuário 20"
      - option "Usuário 21"
      - option "Usuário 22"
      - option "Usuário 23"
      - option "Usuário 24"
      - option "Usuário 25"
      - option "Usuário 26"
      - option "Usuário 27"
      - option "Usuário 28"
      - option "Usuário 29"
      - option "Usuário 3"
      - option "Usuário 30"
      - option "Usuário 4"
      - option "Usuário 5"
      - option "Usuário 6"
      - option "Usuário 7"
      - option "Usuário 8"
      - option "Usuário 9"
      - option "Todas as conversas" [selected]
      - option "Lia"
      - option "Grupo 300"
      - option "Grupo 299"
      - option "Grupo 298"
      - option "Grupo 297"
      - option "Grupo 296"
      - option "Grupo 295"
      - option "Grupo 294"
      - option "Grupo 293"
      - option "Grupo 292"
      - option "Grupo 291"
      - option "Grupo 290"
      - option "Grupo 289"
      - option "Grupo 288"
      - option "Grupo 287"
      - option "Grupo 286"
      - option "Grupo 285"
      - option "Grupo 284"
      - option "Grupo 283"
      - option "Grupo 282"
      - option "Grupo 281"
      - option "Grupo 280"
      - option "Grupo 279"
      - option "Grupo 278"
      - option "Grupo 277"
      - option "Grupo 276"
      - option "Grupo 275"
      - option "Grupo 274"
      - option "Grupo 273"
      - option "Grupo 272"
      - option "Grupo 271"
      - option "Grupo 270"
      - option "Grupo 269"
      - option "Grupo 268"
      - option "Grupo 267"
      - option "Grupo 266"
      - option "Grupo 265"
      - option "Grupo 264"
      - option "Grupo 263"
      - option "Grupo 262"
      - option "Grupo 261"
      - option "Grupo 260"
      - option "Grupo 259"
      - option "Grupo 258"
      - option "Grupo 257"
      - option "Grupo 256"
      - option "Grupo 255"
      - option "Grupo 254"
      - option "Grupo 253"
      - option "Grupo 252"
      - option "Grupo 251"
      - option "Grupo 250"
      - option "Grupo 249"
      - option "Grupo 248"
      - option "Grupo 247"
      - option "Grupo 246"
      - option "Grupo 245"
      - option "Grupo 244"
      - option "Grupo 243"
      - option "Grupo 242"
      - option "Grupo 241"
      - option "Grupo 240"
      - option "Grupo 239"
      - option "Grupo 238"
      - option "Grupo 237"
      - option "Grupo 236"
      - option "Grupo 235"
      - option "Grupo 234"
      - option "Grupo 233"
      - option "Grupo 232"
      - option "Grupo 231"
      - option "Grupo 230"
      - option "Grupo 229"
      - option "Grupo 228"
      - option "Grupo 227"
      - option "Grupo 226"
      - option "Grupo 225"
      - option "Grupo 224"
      - option "Grupo 223"
      - option "Grupo 222"
      - option "Grupo 221"
      - option "Grupo 220"
      - option "Grupo 219"
      - option "Grupo 218"
      - option "Grupo 217"
      - option "Grupo 216"
      - option "Grupo 215"
      - option "Grupo 214"
      - option "Grupo 213"
      - option "Grupo 212"
      - option "Grupo 211"
      - option "Grupo 210"
      - option "Grupo 209"
      - option "Grupo 208"
      - option "Grupo 207"
      - option "Grupo 206"
      - option "Grupo 205"
      - option "Grupo 204"
      - option "Grupo 203"
      - option "Grupo 202"
      - option "Grupo 201"
      - option "Grupo 200"
      - option "Grupo 199"
      - option "Grupo 198"
      - option "Grupo 197"
      - option "Grupo 196"
      - option "Grupo 195"
      - option "Grupo 194"
      - option "Grupo 193"
      - option "Grupo 192"
      - option "Grupo 191"
      - option "Grupo 190"
      - option "Grupo 189"
      - option "Grupo 188"
      - option "Grupo 187"
      - option "Grupo 186"
      - option "Grupo 185"
      - option "Grupo 184"
      - option "Grupo 183"
      - option "Grupo 182"
      - option "Grupo 181"
      - option "Grupo 180"
      - option "Grupo 179"
      - option "Grupo 178"
      - option "Grupo 177"
      - option "Grupo 176"
      - option "Grupo 175"
      - option "Grupo 174"
      - option "Grupo 173"
      - option "Grupo 172"
      - option "Grupo 171"
      - option "Grupo 170"
      - option "Grupo 169"
      - option "Grupo 168"
      - option "Grupo 167"
      - option "Grupo 166"
      - option "Grupo 165"
      - option "Grupo 164"
      - option "Grupo 163"
      - option "Grupo 162"
      - option "Grupo 161"
      - option "Grupo 160"
      - option "Grupo 159"
      - option "Grupo 158"
      - option "Grupo 157"
      - option "Grupo 156"
      - option "Grupo 155"
      - option "Grupo 154"
      - option "Grupo 153"
      - option "Grupo 152"
      - option "Grupo 151"
      - option "Grupo 150"
      - option "Grupo 149"
      - option "Grupo 148"
      - option "Grupo 147"
      - option "Grupo 146"
      - option "Grupo 145"
      - option "Grupo 144"
      - option "Grupo 143"
      - option "Grupo 142"
      - option "Grupo 141"
      - option "Grupo 140"
      - option "Grupo 139"
      - option "Grupo 138"
      - option "Grupo 137"
      - option "Grupo 136"
      - option "Grupo 135"
      - option "Grupo 134"
      - option "Grupo 133"
      - option "Grupo 132"
      - option "Grupo 131"
      - option "Grupo 130"
      - option "Grupo 129"
      - option "Grupo 128"
      - option "Grupo 127"
      - option "Grupo 126"
      - option "Grupo 125"
      - option "Grupo 124"
      - option "Grupo 123"
      - option "Grupo 122"
      - option "Grupo 121"
      - option "Grupo 120"
      - option "Grupo 119"
      - option "Grupo 118"
      - option "Grupo 117"
      - option "Grupo 116"
      - option "Grupo 115"
      - option "Grupo 114"
      - option "Grupo 113"
      - option "Grupo 112"
      - option "Grupo 111"
      - option "Grupo 110"
      - option "Grupo 109"
      - option "Grupo 108"
      - option "Grupo 107"
      - option "Grupo 106"
      - option "Grupo 105"
      - option "Grupo 104"
      - option "Grupo 103"
      - option "Grupo 102"
    - alert
    - button "Mensagens anteriores" [ref=e267] [cursor=pointer]
    - button "Mensagens seguintes" [ref=e268] [cursor=pointer]
    - button "Marcar como não lida" [ref=e269] [cursor=pointer]
    - article [ref=e271]:
      - strong [ref=e272]: Carlos
      - paragraph [ref=e273]: Resposta de velocidade
      - generic [ref=e274]:
        - button "Transformar em Tarefa" [ref=e275] [cursor=pointer]
        - button "Citar" [ref=e276] [cursor=pointer]
        - button "Reagir" [ref=e277] [cursor=pointer]: 👍
        - button "Editar" [ref=e278] [cursor=pointer]
        - button "Apagar" [ref=e279] [cursor=pointer]
    - generic [ref=e280]:
      - generic [ref=e281]:
        - text: Foto
        - button "Foto" [ref=e282]
      - generic [ref=e283]:
        - text: Câmera
        - button "Câmera" [ref=e284]
      - button "Segure para gravar" [ref=e285] [cursor=pointer]
    - generic [ref=e286]: "Visto por: Carlos"
    - generic [ref=e287]:
      - generic [ref=e288]:
        - text: Mensagem
        - textbox "Mensagem" [ref=e289]
      - button "Enviar" [active] [ref=e290] [cursor=pointer]
      - text: "Atalhos: @ pessoa · @todos · @aqui · # grupo · [[ referência · /tarefa · /urgente · /bug"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import pg from "pg";
  3  | import { DATABASE_URL_TEST } from "../../playwright.config";
  4  | import { reiniciar, entrarComo } from "./apoio";
  5  | test("300 mil mensagens: leitura <100 ms e entrega <300 ms", async ({
  6  |   page,
  7  |   browser,
  8  | }) => {
  9  |   test.setTimeout(90000);
  10 |   await reiniciar(page);
  11 |   await entrarComo(page, "carlos");
  12 |   const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  13 |   try {
  14 |     await banco.query(
  15 |       `insert into usuarios(nome,email,senha_hash,papel) select 'Usuário '||n,'volume'||n||'@example.invalid',u.senha_hash,'conteudo' from generate_series(1,30) n cross join (select senha_hash from usuarios limit 1) u`,
  16 |     );
  17 |     await banco.query(
  18 |       `insert into conversas(chave,tipo,nome,criador_id,privada) select 'volume:'||n,'grupo','Grupo '||n,1,false from generate_series(1,300) n`,
  19 |     );
  20 |     await banco.query(
  21 |       `insert into membros_conversa(conversa_id,usuario_id) select c.id,u.id from conversas c cross join usuarios u`,
  22 |     );
  23 |     await banco.query(
  24 |       `insert into mensagens(client_id,conversa_id,autor_id,texto) select 'volume-mensagem-'||n,1+(n%300),1,'Mensagem operacional 서울 '||n from generate_series(1,300000) n`,
  25 |     );
  26 |     await banco.query("analyze mensagens");
  27 |     await banco.query("analyze membros_conversa");
  28 |   } finally {
  29 |     await banco.end();
  30 |   }
  31 |   const ctx = await browser.newContext(),
  32 |     lia = await ctx.newPage();
  33 |   await entrarComo(lia, "lia");
  34 |   for (const url of [
  35 |     "/comunicador/api?conversa=1",
  36 |     "/comunicador/api?busca=operacional",
  37 |   ]) {
  38 |     await page.request.get(url);
  39 |     const inicio = performance.now();
  40 |     expect((await page.request.get(url)).ok()).toBeTruthy();
  41 |     expect(performance.now() - inicio, url).toBeLessThan(100);
  42 |   }
  43 |   await page.getByRole("button", { name: "Comunicador", exact: true }).click();
  44 |   await lia.getByRole("button", { name: "Comunicador", exact: true }).click();
  45 |   await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  46 |   await page.getByRole("button", { name: "Iniciar conversa" }).click();
  47 |   await lia.getByRole("button", { name: "Carlos", exact: true }).click();
  48 |   await page
  49 |     .getByLabel("Mensagem", { exact: true })
  50 |     .fill("Resposta de velocidade");
  51 |   const start = performance.now();
  52 |   await page.getByRole("button", { name: "Enviar", exact: true }).click();
  53 |   await expect(
  54 |     page.getByText("Resposta de velocidade", { exact: true }),
  55 |   ).toBeVisible();
> 56 |   expect(performance.now() - start).toBeLessThan(100);
     |                                     ^ Error: expect(received).toBeLessThan(expected)
  57 |   await expect(
  58 |     lia.getByText("Resposta de velocidade", { exact: true }),
  59 |   ).toBeVisible();
  60 |   expect(performance.now() - start).toBeLessThan(300);
  61 |   await ctx.close();
  62 | });
  63 | 
```