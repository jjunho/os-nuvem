# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quadros-velocidade.spec.ts >> 30 mil Tarefas, 300 Quadros e 600 Viagens respeitam os limites
- Location: tests/e2e/quadros-velocidade.spec.ts:7:1

# Error details

```
Error: leitura /_.data?visualizacao=kanban

expect(received).toBeLessThan(expected)

Expected: < 100
Received:   251.2200419999972
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "Corealux OS" [ref=e3] [cursor=pointer]:
      - /url: /
    - navigation [ref=e4]:
      - button "Comunicador" [ref=e5] [cursor=pointer]
      - link "Pipeline" [ref=e6] [cursor=pointer]:
        - /url: /
      - link "Notificações" [ref=e7] [cursor=pointer]:
        - /url: /notificacoes
      - link "Tabelas de referência" [ref=e8] [cursor=pointer]:
        - /url: /tabelas
      - link "Quadros" [ref=e9] [cursor=pointer]:
        - /url: /quadros
      - link "Tarefas" [ref=e10] [cursor=pointer]:
        - /url: /tarefas
      - link "Nova viagem" [ref=e11] [cursor=pointer]:
        - /url: /viagens/nova
      - link "Modelos de primeira resposta" [ref=e12] [cursor=pointer]:
        - /url: /modelos-resposta
      - link "Opções conhecidas" [ref=e13] [cursor=pointer]:
        - /url: /opcoes
    - button "Buscar" [ref=e14] [cursor=pointer]: Buscar Ctrl K
    - generic [ref=e15]: Carlos
    - combobox "Idioma da interface" [ref=e17]:
      - option "Português" [selected]
      - option "한국어"
    - button "Sair" [ref=e19] [cursor=pointer]
  - region "Boas-vindas" [ref=e20]:
    - paragraph [ref=e21]: O Admin pode ler todas as conversas, inclusive as diretas.
    - button "Entendi" [ref=e22] [cursor=pointer]
  - main [ref=e23]:
    - heading "Pipeline" [level=1] [ref=e24]
    - navigation "Visualização do Pipeline" [ref=e25]:
      - link "Lista" [ref=e26] [cursor=pointer]:
        - /url: /?visualizacao=lista
      - link "Kanban" [ref=e27] [cursor=pointer]:
        - /url: /?visualizacao=kanban
    - generic [ref=e28]:
      - generic [ref=e29]:
        - text: Responsável
        - combobox "Responsável" [ref=e30]:
          - option "Todos" [selected]
          - option "Carlos"
          - option "Hyewon Ku (Helena)"
          - option "Jessica"
          - option "Lia"
          - option "Lidiane"
          - option "Volume 1"
          - option "Volume 10"
          - option "Volume 11"
          - option "Volume 12"
          - option "Volume 13"
          - option "Volume 14"
          - option "Volume 15"
          - option "Volume 16"
          - option "Volume 17"
          - option "Volume 18"
          - option "Volume 19"
          - option "Volume 2"
          - option "Volume 20"
          - option "Volume 21"
          - option "Volume 22"
          - option "Volume 23"
          - option "Volume 24"
          - option "Volume 25"
          - option "Volume 26"
          - option "Volume 27"
          - option "Volume 28"
          - option "Volume 29"
          - option "Volume 3"
          - option "Volume 30"
          - option "Volume 4"
          - option "Volume 5"
          - option "Volume 6"
          - option "Volume 7"
          - option "Volume 8"
          - option "Volume 9"
      - generic [ref=e31]:
        - text: Canal comercial
        - combobox "Canal comercial" [ref=e32]:
          - option "Todos" [selected]
          - option "Interep/Operadora"
          - option "Agência"
          - option "Cliente final"
          - option "Influencer"
      - generic [ref=e33]:
        - checkbox "Próxima ação atrasada" [ref=e34]
        - text: Próxima ação atrasada
      - button "Filtrar" [ref=e35] [cursor=pointer]
    - table [ref=e36]:
      - rowgroup [ref=e37]:
        - row [ref=e38]:
          - columnheader "Código" [ref=e39]
          - columnheader "Contato" [ref=e40]
          - columnheader "Etapa" [ref=e41]
          - columnheader "Canal" [ref=e42]
          - columnheader "Responsável" [ref=e43]
          - columnheader "Datas" [ref=e44]
          - columnheader "Pax" [ref=e45]
          - columnheader "Próxima ação" [ref=e46]
          - columnheader "Prazo" [ref=e47]
      - rowgroup [ref=e48]:
        - row [ref=e49]:
          - cell [ref=e50]:
            - link "V26-0600" [ref=e51] [cursor=pointer]:
              - /url: /viagens/600
          - cell "Cliente volume 600" [ref=e52]
          - cell "Lead" [ref=e53]
          - cell "Cliente final" [ref=e54]
          - cell "Carlos" [ref=e55]
          - cell "— → —" [ref=e56]
          - cell "0" [ref=e57]
          - cell "Tarefa volume 599" [ref=e58]
          - cell "01/10/2026, 09:00" [ref=e59]
        - row [ref=e60]:
          - cell [ref=e61]:
            - link "V26-0599" [ref=e62] [cursor=pointer]:
              - /url: /viagens/599
          - cell "Cliente volume 599" [ref=e63]
          - cell "Lead" [ref=e64]
          - cell "Cliente final" [ref=e65]
          - cell "Carlos" [ref=e66]
          - cell "— → —" [ref=e67]
          - cell "0" [ref=e68]
          - cell "Tarefa volume 598" [ref=e69]
          - cell "01/10/2026, 09:00" [ref=e70]
        - row [ref=e71]:
          - cell [ref=e72]:
            - link "V26-0598" [ref=e73] [cursor=pointer]:
              - /url: /viagens/598
          - cell "Cliente volume 598" [ref=e74]
          - cell "Lead" [ref=e75]
          - cell "Cliente final" [ref=e76]
          - cell "Carlos" [ref=e77]
          - cell "— → —" [ref=e78]
          - cell "0" [ref=e79]
          - cell "Tarefa volume 597" [ref=e80]
          - cell "01/10/2026, 09:00" [ref=e81]
        - row [ref=e82]:
          - cell [ref=e83]:
            - link "V26-0597" [ref=e84] [cursor=pointer]:
              - /url: /viagens/597
          - cell "Cliente volume 597" [ref=e85]
          - cell "Lead" [ref=e86]
          - cell "Cliente final" [ref=e87]
          - cell "Carlos" [ref=e88]
          - cell "— → —" [ref=e89]
          - cell "0" [ref=e90]
          - cell "Tarefa volume 596" [ref=e91]
          - cell "01/10/2026, 09:00" [ref=e92]
        - row [ref=e93]:
          - cell [ref=e94]:
            - link "V26-0596" [ref=e95] [cursor=pointer]:
              - /url: /viagens/596
          - cell "Cliente volume 596" [ref=e96]
          - cell "Lead" [ref=e97]
          - cell "Cliente final" [ref=e98]
          - cell "Carlos" [ref=e99]
          - cell "— → —" [ref=e100]
          - cell "0" [ref=e101]
          - cell "Tarefa volume 595" [ref=e102]
          - cell "01/10/2026, 09:00" [ref=e103]
        - row [ref=e104]:
          - cell [ref=e105]:
            - link "V26-0595" [ref=e106] [cursor=pointer]:
              - /url: /viagens/595
          - cell "Cliente volume 595" [ref=e107]
          - cell "Lead" [ref=e108]
          - cell "Cliente final" [ref=e109]
          - cell "Carlos" [ref=e110]
          - cell "— → —" [ref=e111]
          - cell "0" [ref=e112]
          - cell "Tarefa volume 594" [ref=e113]
          - cell "01/10/2026, 09:00" [ref=e114]
        - row [ref=e115]:
          - cell [ref=e116]:
            - link "V26-0594" [ref=e117] [cursor=pointer]:
              - /url: /viagens/594
          - cell "Cliente volume 594" [ref=e118]
          - cell "Lead" [ref=e119]
          - cell "Cliente final" [ref=e120]
          - cell "Carlos" [ref=e121]
          - cell "— → —" [ref=e122]
          - cell "0" [ref=e123]
          - cell "Tarefa volume 593" [ref=e124]
          - cell "01/10/2026, 09:00" [ref=e125]
        - row [ref=e126]:
          - cell [ref=e127]:
            - link "V26-0593" [ref=e128] [cursor=pointer]:
              - /url: /viagens/593
          - cell "Cliente volume 593" [ref=e129]
          - cell "Lead" [ref=e130]
          - cell "Cliente final" [ref=e131]
          - cell "Carlos" [ref=e132]
          - cell "— → —" [ref=e133]
          - cell "0" [ref=e134]
          - cell "Tarefa volume 592" [ref=e135]
          - cell "01/10/2026, 09:00" [ref=e136]
        - row [ref=e137]:
          - cell [ref=e138]:
            - link "V26-0592" [ref=e139] [cursor=pointer]:
              - /url: /viagens/592
          - cell "Cliente volume 592" [ref=e140]
          - cell "Lead" [ref=e141]
          - cell "Cliente final" [ref=e142]
          - cell "Carlos" [ref=e143]
          - cell "— → —" [ref=e144]
          - cell "0" [ref=e145]
          - cell "Tarefa volume 591" [ref=e146]
          - cell "01/10/2026, 09:00" [ref=e147]
        - row [ref=e148]:
          - cell [ref=e149]:
            - link "V26-0591" [ref=e150] [cursor=pointer]:
              - /url: /viagens/591
          - cell "Cliente volume 591" [ref=e151]
          - cell "Lead" [ref=e152]
          - cell "Cliente final" [ref=e153]
          - cell "Carlos" [ref=e154]
          - cell "— → —" [ref=e155]
          - cell "0" [ref=e156]
          - cell "Tarefa volume 590" [ref=e157]
          - cell "01/10/2026, 09:00" [ref=e158]
        - row [ref=e159]:
          - cell [ref=e160]:
            - link "V26-0590" [ref=e161] [cursor=pointer]:
              - /url: /viagens/590
          - cell "Cliente volume 590" [ref=e162]
          - cell "Lead" [ref=e163]
          - cell "Cliente final" [ref=e164]
          - cell "Carlos" [ref=e165]
          - cell "— → —" [ref=e166]
          - cell "0" [ref=e167]
          - cell "Tarefa volume 589" [ref=e168]
          - cell "01/10/2026, 09:00" [ref=e169]
        - row [ref=e170]:
          - cell [ref=e171]:
            - link "V26-0589" [ref=e172] [cursor=pointer]:
              - /url: /viagens/589
          - cell "Cliente volume 589" [ref=e173]
          - cell "Lead" [ref=e174]
          - cell "Cliente final" [ref=e175]
          - cell "Carlos" [ref=e176]
          - cell "— → —" [ref=e177]
          - cell "0" [ref=e178]
          - cell "Tarefa volume 588" [ref=e179]
          - cell "01/10/2026, 09:00" [ref=e180]
        - row [ref=e181]:
          - cell [ref=e182]:
            - link "V26-0588" [ref=e183] [cursor=pointer]:
              - /url: /viagens/588
          - cell "Cliente volume 588" [ref=e184]
          - cell "Lead" [ref=e185]
          - cell "Cliente final" [ref=e186]
          - cell "Carlos" [ref=e187]
          - cell "— → —" [ref=e188]
          - cell "0" [ref=e189]
          - cell "Tarefa volume 587" [ref=e190]
          - cell "01/10/2026, 09:00" [ref=e191]
        - row [ref=e192]:
          - cell [ref=e193]:
            - link "V26-0587" [ref=e194] [cursor=pointer]:
              - /url: /viagens/587
          - cell "Cliente volume 587" [ref=e195]
          - cell "Lead" [ref=e196]
          - cell "Cliente final" [ref=e197]
          - cell "Carlos" [ref=e198]
          - cell "— → —" [ref=e199]
          - cell "0" [ref=e200]
          - cell "Tarefa volume 586" [ref=e201]
          - cell "01/10/2026, 09:00" [ref=e202]
        - row [ref=e203]:
          - cell [ref=e204]:
            - link "V26-0586" [ref=e205] [cursor=pointer]:
              - /url: /viagens/586
          - cell "Cliente volume 586" [ref=e206]
          - cell "Lead" [ref=e207]
          - cell "Cliente final" [ref=e208]
          - cell "Carlos" [ref=e209]
          - cell "— → —" [ref=e210]
          - cell "0" [ref=e211]
          - cell "Tarefa volume 585" [ref=e212]
          - cell "01/10/2026, 09:00" [ref=e213]
        - row [ref=e214]:
          - cell [ref=e215]:
            - link "V26-0585" [ref=e216] [cursor=pointer]:
              - /url: /viagens/585
          - cell "Cliente volume 585" [ref=e217]
          - cell "Lead" [ref=e218]
          - cell "Cliente final" [ref=e219]
          - cell "Carlos" [ref=e220]
          - cell "— → —" [ref=e221]
          - cell "0" [ref=e222]
          - cell "Tarefa volume 584" [ref=e223]
          - cell "01/10/2026, 09:00" [ref=e224]
        - row [ref=e225]:
          - cell [ref=e226]:
            - link "V26-0584" [ref=e227] [cursor=pointer]:
              - /url: /viagens/584
          - cell "Cliente volume 584" [ref=e228]
          - cell "Lead" [ref=e229]
          - cell "Cliente final" [ref=e230]
          - cell "Carlos" [ref=e231]
          - cell "— → —" [ref=e232]
          - cell "0" [ref=e233]
          - cell "Tarefa volume 583" [ref=e234]
          - cell "01/10/2026, 09:00" [ref=e235]
        - row [ref=e236]:
          - cell [ref=e237]:
            - link "V26-0583" [ref=e238] [cursor=pointer]:
              - /url: /viagens/583
          - cell "Cliente volume 583" [ref=e239]
          - cell "Lead" [ref=e240]
          - cell "Cliente final" [ref=e241]
          - cell "Carlos" [ref=e242]
          - cell "— → —" [ref=e243]
          - cell "0" [ref=e244]
          - cell "Tarefa volume 582" [ref=e245]
          - cell "01/10/2026, 09:00" [ref=e246]
        - row [ref=e247]:
          - cell [ref=e248]:
            - link "V26-0582" [ref=e249] [cursor=pointer]:
              - /url: /viagens/582
          - cell "Cliente volume 582" [ref=e250]
          - cell "Lead" [ref=e251]
          - cell "Cliente final" [ref=e252]
          - cell "Carlos" [ref=e253]
          - cell "— → —" [ref=e254]
          - cell "0" [ref=e255]
          - cell "Tarefa volume 581" [ref=e256]
          - cell "01/10/2026, 09:00" [ref=e257]
        - row [ref=e258]:
          - cell [ref=e259]:
            - link "V26-0581" [ref=e260] [cursor=pointer]:
              - /url: /viagens/581
          - cell "Cliente volume 581" [ref=e261]
          - cell "Lead" [ref=e262]
          - cell "Cliente final" [ref=e263]
          - cell "Carlos" [ref=e264]
          - cell "— → —" [ref=e265]
          - cell "0" [ref=e266]
          - cell "Tarefa volume 580" [ref=e267]
          - cell "01/10/2026, 09:00" [ref=e268]
        - row [ref=e269]:
          - cell [ref=e270]:
            - link "V26-0580" [ref=e271] [cursor=pointer]:
              - /url: /viagens/580
          - cell "Cliente volume 580" [ref=e272]
          - cell "Lead" [ref=e273]
          - cell "Cliente final" [ref=e274]
          - cell "Carlos" [ref=e275]
          - cell "— → —" [ref=e276]
          - cell "0" [ref=e277]
          - cell "Tarefa volume 579" [ref=e278]
          - cell "01/10/2026, 09:00" [ref=e279]
        - row [ref=e280]:
          - cell [ref=e281]:
            - link "V26-0579" [ref=e282] [cursor=pointer]:
              - /url: /viagens/579
          - cell "Cliente volume 579" [ref=e283]
          - cell "Lead" [ref=e284]
          - cell "Cliente final" [ref=e285]
          - cell "Carlos" [ref=e286]
          - cell "— → —" [ref=e287]
          - cell "0" [ref=e288]
          - cell "Tarefa volume 578" [ref=e289]
          - cell "01/10/2026, 09:00" [ref=e290]
        - row [ref=e291]:
          - cell [ref=e292]:
            - link "V26-0578" [ref=e293] [cursor=pointer]:
              - /url: /viagens/578
          - cell "Cliente volume 578" [ref=e294]
          - cell "Lead" [ref=e295]
          - cell "Cliente final" [ref=e296]
          - cell "Carlos" [ref=e297]
          - cell "— → —" [ref=e298]
          - cell "0" [ref=e299]
          - cell "Tarefa volume 577" [ref=e300]
          - cell "01/10/2026, 09:00" [ref=e301]
        - row [ref=e302]:
          - cell [ref=e303]:
            - link "V26-0577" [ref=e304] [cursor=pointer]:
              - /url: /viagens/577
          - cell "Cliente volume 577" [ref=e305]
          - cell "Lead" [ref=e306]
          - cell "Cliente final" [ref=e307]
          - cell "Carlos" [ref=e308]
          - cell "— → —" [ref=e309]
          - cell "0" [ref=e310]
          - cell "Tarefa volume 576" [ref=e311]
          - cell "01/10/2026, 09:00" [ref=e312]
        - row [ref=e313]:
          - cell [ref=e314]:
            - link "V26-0576" [ref=e315] [cursor=pointer]:
              - /url: /viagens/576
          - cell "Cliente volume 576" [ref=e316]
          - cell "Lead" [ref=e317]
          - cell "Cliente final" [ref=e318]
          - cell "Carlos" [ref=e319]
          - cell "— → —" [ref=e320]
          - cell "0" [ref=e321]
          - cell "Tarefa volume 575" [ref=e322]
          - cell "01/10/2026, 09:00" [ref=e323]
        - row [ref=e324]:
          - cell [ref=e325]:
            - link "V26-0575" [ref=e326] [cursor=pointer]:
              - /url: /viagens/575
          - cell "Cliente volume 575" [ref=e327]
          - cell "Lead" [ref=e328]
          - cell "Cliente final" [ref=e329]
          - cell "Carlos" [ref=e330]
          - cell "— → —" [ref=e331]
          - cell "0" [ref=e332]
          - cell "Tarefa volume 574" [ref=e333]
          - cell "01/10/2026, 09:00" [ref=e334]
        - row [ref=e335]:
          - cell [ref=e336]:
            - link "V26-0574" [ref=e337] [cursor=pointer]:
              - /url: /viagens/574
          - cell "Cliente volume 574" [ref=e338]
          - cell "Lead" [ref=e339]
          - cell "Cliente final" [ref=e340]
          - cell "Carlos" [ref=e341]
          - cell "— → —" [ref=e342]
          - cell "0" [ref=e343]
          - cell "Tarefa volume 573" [ref=e344]
          - cell "01/10/2026, 09:00" [ref=e345]
        - row [ref=e346]:
          - cell [ref=e347]:
            - link "V26-0573" [ref=e348] [cursor=pointer]:
              - /url: /viagens/573
          - cell "Cliente volume 573" [ref=e349]
          - cell "Lead" [ref=e350]
          - cell "Cliente final" [ref=e351]
          - cell "Carlos" [ref=e352]
          - cell "— → —" [ref=e353]
          - cell "0" [ref=e354]
          - cell "Tarefa volume 572" [ref=e355]
          - cell "01/10/2026, 09:00" [ref=e356]
        - row [ref=e357]:
          - cell [ref=e358]:
            - link "V26-0572" [ref=e359] [cursor=pointer]:
              - /url: /viagens/572
          - cell "Cliente volume 572" [ref=e360]
          - cell "Lead" [ref=e361]
          - cell "Cliente final" [ref=e362]
          - cell "Carlos" [ref=e363]
          - cell "— → —" [ref=e364]
          - cell "0" [ref=e365]
          - cell "Tarefa volume 571" [ref=e366]
          - cell "01/10/2026, 09:00" [ref=e367]
        - row [ref=e368]:
          - cell [ref=e369]:
            - link "V26-0571" [ref=e370] [cursor=pointer]:
              - /url: /viagens/571
          - cell "Cliente volume 571" [ref=e371]
          - cell "Lead" [ref=e372]
          - cell "Cliente final" [ref=e373]
          - cell "Carlos" [ref=e374]
          - cell "— → —" [ref=e375]
          - cell "0" [ref=e376]
          - cell "Tarefa volume 570" [ref=e377]
          - cell "01/10/2026, 09:00" [ref=e378]
        - row [ref=e379]:
          - cell [ref=e380]:
            - link "V26-0570" [ref=e381] [cursor=pointer]:
              - /url: /viagens/570
          - cell "Cliente volume 570" [ref=e382]
          - cell "Lead" [ref=e383]
          - cell "Cliente final" [ref=e384]
          - cell "Carlos" [ref=e385]
          - cell "— → —" [ref=e386]
          - cell "0" [ref=e387]
          - cell "Tarefa volume 569" [ref=e388]
          - cell "01/10/2026, 09:00" [ref=e389]
        - row [ref=e390]:
          - cell [ref=e391]:
            - link "V26-0569" [ref=e392] [cursor=pointer]:
              - /url: /viagens/569
          - cell "Cliente volume 569" [ref=e393]
          - cell "Lead" [ref=e394]
          - cell "Cliente final" [ref=e395]
          - cell "Carlos" [ref=e396]
          - cell "— → —" [ref=e397]
          - cell "0" [ref=e398]
          - cell "Tarefa volume 568" [ref=e399]
          - cell "01/10/2026, 09:00" [ref=e400]
        - row [ref=e401]:
          - cell [ref=e402]:
            - link "V26-0568" [ref=e403] [cursor=pointer]:
              - /url: /viagens/568
          - cell "Cliente volume 568" [ref=e404]
          - cell "Lead" [ref=e405]
          - cell "Cliente final" [ref=e406]
          - cell "Carlos" [ref=e407]
          - cell "— → —" [ref=e408]
          - cell "0" [ref=e409]
          - cell "Tarefa volume 567" [ref=e410]
          - cell "01/10/2026, 09:00" [ref=e411]
        - row [ref=e412]:
          - cell [ref=e413]:
            - link "V26-0567" [ref=e414] [cursor=pointer]:
              - /url: /viagens/567
          - cell "Cliente volume 567" [ref=e415]
          - cell "Lead" [ref=e416]
          - cell "Cliente final" [ref=e417]
          - cell "Carlos" [ref=e418]
          - cell "— → —" [ref=e419]
          - cell "0" [ref=e420]
          - cell "Tarefa volume 566" [ref=e421]
          - cell "01/10/2026, 09:00" [ref=e422]
        - row [ref=e423]:
          - cell [ref=e424]:
            - link "V26-0566" [ref=e425] [cursor=pointer]:
              - /url: /viagens/566
          - cell "Cliente volume 566" [ref=e426]
          - cell "Lead" [ref=e427]
          - cell "Cliente final" [ref=e428]
          - cell "Carlos" [ref=e429]
          - cell "— → —" [ref=e430]
          - cell "0" [ref=e431]
          - cell "Tarefa volume 565" [ref=e432]
          - cell "01/10/2026, 09:00" [ref=e433]
        - row [ref=e434]:
          - cell [ref=e435]:
            - link "V26-0565" [ref=e436] [cursor=pointer]:
              - /url: /viagens/565
          - cell "Cliente volume 565" [ref=e437]
          - cell "Lead" [ref=e438]
          - cell "Cliente final" [ref=e439]
          - cell "Carlos" [ref=e440]
          - cell "— → —" [ref=e441]
          - cell "0" [ref=e442]
          - cell "Tarefa volume 564" [ref=e443]
          - cell "01/10/2026, 09:00" [ref=e444]
        - row [ref=e445]:
          - cell [ref=e446]:
            - link "V26-0564" [ref=e447] [cursor=pointer]:
              - /url: /viagens/564
          - cell "Cliente volume 564" [ref=e448]
          - cell "Lead" [ref=e449]
          - cell "Cliente final" [ref=e450]
          - cell "Carlos" [ref=e451]
          - cell "— → —" [ref=e452]
          - cell "0" [ref=e453]
          - cell "Tarefa volume 563" [ref=e454]
          - cell "01/10/2026, 09:00" [ref=e455]
        - row [ref=e456]:
          - cell [ref=e457]:
            - link "V26-0563" [ref=e458] [cursor=pointer]:
              - /url: /viagens/563
          - cell "Cliente volume 563" [ref=e459]
          - cell "Lead" [ref=e460]
          - cell "Cliente final" [ref=e461]
          - cell "Carlos" [ref=e462]
          - cell "— → —" [ref=e463]
          - cell "0" [ref=e464]
          - cell "Tarefa volume 562" [ref=e465]
          - cell "01/10/2026, 09:00" [ref=e466]
        - row [ref=e467]:
          - cell [ref=e468]:
            - link "V26-0562" [ref=e469] [cursor=pointer]:
              - /url: /viagens/562
          - cell "Cliente volume 562" [ref=e470]
          - cell "Lead" [ref=e471]
          - cell "Cliente final" [ref=e472]
          - cell "Carlos" [ref=e473]
          - cell "— → —" [ref=e474]
          - cell "0" [ref=e475]
          - cell "Tarefa volume 561" [ref=e476]
          - cell "01/10/2026, 09:00" [ref=e477]
        - row [ref=e478]:
          - cell [ref=e479]:
            - link "V26-0561" [ref=e480] [cursor=pointer]:
              - /url: /viagens/561
          - cell "Cliente volume 561" [ref=e481]
          - cell "Lead" [ref=e482]
          - cell "Cliente final" [ref=e483]
          - cell "Carlos" [ref=e484]
          - cell "— → —" [ref=e485]
          - cell "0" [ref=e486]
          - cell "Tarefa volume 560" [ref=e487]
          - cell "01/10/2026, 09:00" [ref=e488]
        - row [ref=e489]:
          - cell [ref=e490]:
            - link "V26-0560" [ref=e491] [cursor=pointer]:
              - /url: /viagens/560
          - cell "Cliente volume 560" [ref=e492]
          - cell "Lead" [ref=e493]
          - cell "Cliente final" [ref=e494]
          - cell "Carlos" [ref=e495]
          - cell "— → —" [ref=e496]
          - cell "0" [ref=e497]
          - cell "Tarefa volume 559" [ref=e498]
          - cell "01/10/2026, 09:00" [ref=e499]
        - row [ref=e500]:
          - cell [ref=e501]:
            - link "V26-0559" [ref=e502] [cursor=pointer]:
              - /url: /viagens/559
          - cell "Cliente volume 559" [ref=e503]
          - cell "Lead" [ref=e504]
          - cell "Cliente final" [ref=e505]
          - cell "Carlos" [ref=e506]
          - cell "— → —" [ref=e507]
          - cell "0" [ref=e508]
          - cell "Tarefa volume 558" [ref=e509]
          - cell "01/10/2026, 09:00" [ref=e510]
        - row [ref=e511]:
          - cell [ref=e512]:
            - link "V26-0558" [ref=e513] [cursor=pointer]:
              - /url: /viagens/558
          - cell "Cliente volume 558" [ref=e514]
          - cell "Lead" [ref=e515]
          - cell "Cliente final" [ref=e516]
          - cell "Carlos" [ref=e517]
          - cell "— → —" [ref=e518]
          - cell "0" [ref=e519]
          - cell "Tarefa volume 557" [ref=e520]
          - cell "01/10/2026, 09:00" [ref=e521]
        - row [ref=e522]:
          - cell [ref=e523]:
            - link "V26-0557" [ref=e524] [cursor=pointer]:
              - /url: /viagens/557
          - cell "Cliente volume 557" [ref=e525]
          - cell "Lead" [ref=e526]
          - cell "Cliente final" [ref=e527]
          - cell "Carlos" [ref=e528]
          - cell "— → —" [ref=e529]
          - cell "0" [ref=e530]
          - cell "Tarefa volume 556" [ref=e531]
          - cell "01/10/2026, 09:00" [ref=e532]
        - row [ref=e533]:
          - cell [ref=e534]:
            - link "V26-0556" [ref=e535] [cursor=pointer]:
              - /url: /viagens/556
          - cell "Cliente volume 556" [ref=e536]
          - cell "Lead" [ref=e537]
          - cell "Cliente final" [ref=e538]
          - cell "Carlos" [ref=e539]
          - cell "— → —" [ref=e540]
          - cell "0" [ref=e541]
          - cell "Tarefa volume 555" [ref=e542]
          - cell "01/10/2026, 09:00" [ref=e543]
        - row [ref=e544]:
          - cell [ref=e545]:
            - link "V26-0555" [ref=e546] [cursor=pointer]:
              - /url: /viagens/555
          - cell "Cliente volume 555" [ref=e547]
          - cell "Lead" [ref=e548]
          - cell "Cliente final" [ref=e549]
          - cell "Carlos" [ref=e550]
          - cell "— → —" [ref=e551]
          - cell "0" [ref=e552]
          - cell "Tarefa volume 554" [ref=e553]
          - cell "01/10/2026, 09:00" [ref=e554]
        - row [ref=e555]:
          - cell [ref=e556]:
            - link "V26-0554" [ref=e557] [cursor=pointer]:
              - /url: /viagens/554
          - cell "Cliente volume 554" [ref=e558]
          - cell "Lead" [ref=e559]
          - cell "Cliente final" [ref=e560]
          - cell "Carlos" [ref=e561]
          - cell "— → —" [ref=e562]
          - cell "0" [ref=e563]
          - cell "Tarefa volume 553" [ref=e564]
          - cell "01/10/2026, 09:00" [ref=e565]
        - row [ref=e566]:
          - cell [ref=e567]:
            - link "V26-0553" [ref=e568] [cursor=pointer]:
              - /url: /viagens/553
          - cell "Cliente volume 553" [ref=e569]
          - cell "Lead" [ref=e570]
          - cell "Cliente final" [ref=e571]
          - cell "Carlos" [ref=e572]
          - cell "— → —" [ref=e573]
          - cell "0" [ref=e574]
          - cell "Tarefa volume 552" [ref=e575]
          - cell "01/10/2026, 09:00" [ref=e576]
        - row [ref=e577]:
          - cell [ref=e578]:
            - link "V26-0552" [ref=e579] [cursor=pointer]:
              - /url: /viagens/552
          - cell "Cliente volume 552" [ref=e580]
          - cell "Lead" [ref=e581]
          - cell "Cliente final" [ref=e582]
          - cell "Carlos" [ref=e583]
          - cell "— → —" [ref=e584]
          - cell "0" [ref=e585]
          - cell "Tarefa volume 551" [ref=e586]
          - cell "01/10/2026, 09:00" [ref=e587]
        - row [ref=e588]:
          - cell [ref=e589]:
            - link "V26-0551" [ref=e590] [cursor=pointer]:
              - /url: /viagens/551
          - cell "Cliente volume 551" [ref=e591]
          - cell "Lead" [ref=e592]
          - cell "Cliente final" [ref=e593]
          - cell "Carlos" [ref=e594]
          - cell "— → —" [ref=e595]
          - cell "0" [ref=e596]
          - cell "Tarefa volume 550" [ref=e597]
          - cell "01/10/2026, 09:00" [ref=e598]
    - navigation "Páginas" [ref=e599]:
      - link "Próxima página" [ref=e600] [cursor=pointer]:
        - /url: /?pagina=2
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import pg from "pg";
  3   | import { DATABASE_URL_TEST } from "../../playwright.config";
  4   | import { entrarComo, reiniciar, relogio, T0 } from "./apoio";
  5   | 
  6   | // ADR-0003: browser-visible latency, real authorization, persistence and SSE.
  7   | test("30 mil Tarefas, 300 Quadros e 600 Viagens respeitam os limites", async ({
  8   |   page,
  9   |   browser,
  10  | }) => {
  11  |   test.setTimeout(120000);
  12  |   await reiniciar(page);
  13  |   const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  14  |   let quadroId = 0,
  15  |     listaId = 0,
  16  |     tarefaId = 0;
  17  |   try {
  18  |     await banco.query(`
  19  |       insert into usuarios(nome,email,senha_hash,papel)
  20  |       select 'Volume '||n,'quadros-volume-'||n||'@example.invalid',senha_hash,'conteudo'
  21  |       from generate_series(1,30) n cross join (select senha_hash from usuarios where email='carlos@corealux.com') u;
  22  |       insert into quadros(nome,criador_id) select 'Quadro volume '||n,1 from generate_series(1,300) n;
  23  |       insert into quadros_membros(quadro_id,usuario_id)
  24  |       select q.id,u.id from quadros q cross join usuarios u where not q.pessoal and u.papel<>'guiamento';
  25  |       insert into quadros_listas(quadro_id,nome,posicao)
  26  |       select q.id,l.nome,l.posicao from quadros q cross join (values ('Novo',1),('Em foco',2),('Concluído',3)) l(nome,posicao) where not q.pessoal;
  27  |       insert into viagens(codigo,etapa,canal_comercial,marca,origem,criada_em)
  28  |       select 'V26-'||lpad(n::text,4,'0'),'lead','cliente_final','guia_na_coreia','site',timestamptz '2026-09-24 09:00:00+09' from generate_series(1,600) n;
  29  |       insert into contatos(numero,nome) select numero_cliente(2026),'Cliente volume '||n from generate_series(1,600) n;
  30  |       insert into viagem_contatos(viagem_id,contato_id,papel) select id,id,'solicitante' from viagens;
  31  |       insert into responsaveis(viagem_id,usuario_id,desde) select id,1,timestamptz '2026-09-24 09:00:00+09' from viagens;
  32  |       insert into tarefas(titulo,tipo,responsavel_id,prazo,viagem_id)
  33  |       select 'Tarefa volume '||n,'manual',1+(n%2),timestamptz '2026-10-01 09:00:00+09',1+(n%600) from generate_series(1,30000) n;
  34  |       update tarefas_posicoes p set quadro_id=q.id,lista_id=l.id
  35  |       from tarefas t join quadros q on q.nome='Quadro volume '||(1+((split_part(t.titulo,' ',3)::int-1)%300))
  36  |       join quadros_listas l on l.quadro_id=q.id and l.nome='Novo' where p.tarefa_id=t.id;
  37  |       insert into sequencias_identificador(chave,valor) values('viagem:2026',600) on conflict(chave) do update set valor=600;
  38  |       analyze;
  39  |     `);
  40  |     const {
  41  |       rows: [dados],
  42  |     } = await banco.query<{ quadro: number; lista: number; tarefa: number }>(`
  43  |       select q.id as quadro,l.id as lista,t.id as tarefa from quadros q
  44  |       join quadros_listas l on l.quadro_id=q.id and l.nome='Em foco'
  45  |       join tarefas t on t.titulo='Tarefa volume 1' where q.nome='Quadro volume 1'`);
  46  |     quadroId = dados.quadro;
  47  |     listaId = dados.lista;
  48  |     tarefaId = dados.tarefa;
  49  |   } finally {
  50  |     await banco.end();
  51  |   }
  52  | 
  53  |   const ctx = await browser.newContext(),
  54  |     outra = await ctx.newPage();
  55  |   try {
  56  |     await relogio(page, T0);
  57  |     await relogio(outra, T0);
  58  |     await entrarComo(page, "Carlos");
  59  |     await entrarComo(outra, "Lia");
  60  |     for (const usuario of [page, outra]) {
  61  |       for (const url of [
  62  |         `/quadros/${quadroId}.data`,
  63  |         "/_.data?visualizacao=kanban",
  64  |       ]) {
  65  |         expect((await usuario.request.get(url)).ok()).toBeTruthy();
  66  |         const inicio = performance.now();
  67  |         const resposta = await usuario.request.get(url);
  68  |         expect(resposta.ok()).toBeTruthy();
  69  |         await resposta.body();
> 70  |         expect(performance.now() - inicio, `leitura ${url}`).toBeLessThan(100);
      |                                                              ^ Error: leitura /_.data?visualizacao=kanban
  71  |       }
  72  |     }
  73  |     await page.goto("/quadros");
  74  |     const navegar = async (nome: string, seletor: string) =>
  75  |       page.evaluate(
  76  |         async ({ nome, seletor }) => {
  77  |           const link = [...document.querySelectorAll("a")].find(
  78  |             (a) => a.textContent?.trim() === nome,
  79  |           );
  80  |           if (!link) throw new Error(`Link ausente: ${nome}`);
  81  |           const inicio = performance.now();
  82  |           link.click();
  83  |           await new Promise<void>((resolve) => {
  84  |             const verificar = () =>
  85  |               document.querySelector(seletor)
  86  |                 ? resolve()
  87  |                 : requestAnimationFrame(verificar);
  88  |             verificar();
  89  |           });
  90  |           return performance.now() - inicio;
  91  |         },
  92  |         { nome, seletor },
  93  |       );
  94  |     expect(
  95  |       await navegar("Quadro volume 1", ".quadro-tarefa"),
  96  |       "abrir Quadro",
  97  |     ).toBeLessThan(300);
  98  |     expect(
  99  |       await navegar("Pipeline", "tbody tr"),
  100 |       "abrir Pipeline",
  101 |     ).toBeLessThan(300);
  102 |     expect(
  103 |       await navegar("Kanban", ".pipeline-cartao"),
  104 |       "abrir Pipeline kanban",
  105 |     ).toBeLessThan(300);
  106 |     await expect(page.getByTestId("pipeline-cartao")).toHaveCount(50);
  107 |     await page.goto(`/quadros/${quadroId}`);
  108 |     await outra.goto(`/quadros/${quadroId}`);
  109 |     const destino = `[data-testid="lista-${listaId}"] a[href="/tarefas/${tarefaId}"]`;
  110 |     await expect(page.locator(`a[href="/tarefas/${tarefaId}"]`)).toBeVisible();
  111 |     await expect(outra.locator(destino)).toHaveCount(0);
  112 |     const [remoto, local] = await Promise.all([
  113 |       outra.evaluate(async (seletor) => {
  114 |         await new Promise<void>((resolve) => {
  115 |           const verificar = () =>
  116 |             document.querySelector(seletor)
  117 |               ? resolve()
  118 |               : requestAnimationFrame(verificar);
  119 |           verificar();
  120 |         });
  121 |         return Date.now();
  122 |       }, destino),
  123 |       page.evaluate(
  124 |         async ({ tarefaId, listaId, destino }) => {
  125 |           const origem = document
  126 |             .querySelector(`a[href="/tarefas/${tarefaId}"]`)!
  127 |             .closest("article")!;
  128 |           const alvo = document.querySelector(
  129 |             `[data-testid="lista-${listaId}"]`,
  130 |           )!;
  131 |           const transferencia = new DataTransfer();
  132 |           const inicio = Date.now();
  133 |           origem.dispatchEvent(
  134 |             new DragEvent("dragstart", {
  135 |               bubbles: true,
  136 |               dataTransfer: transferencia,
  137 |             }),
  138 |           );
  139 |           alvo.dispatchEvent(
  140 |             new DragEvent("drop", {
  141 |               bubbles: true,
  142 |               cancelable: true,
  143 |               dataTransfer: transferencia,
  144 |             }),
  145 |           );
  146 |           await new Promise<void>((resolve) => {
  147 |             const verificar = () =>
  148 |               document.querySelector(destino)
  149 |                 ? resolve()
  150 |                 : requestAnimationFrame(verificar);
  151 |             verificar();
  152 |           });
  153 |           return { inicio, decorrido: Date.now() - inicio };
  154 |         },
  155 |         { tarefaId, listaId, destino },
  156 |       ),
  157 |     ]);
  158 |     expect(local.decorrido, "movimento local").toBeLessThan(100);
  159 |     expect(remoto - local.inicio, "movimento recebido por SSE").toBeLessThan(
  160 |       300,
  161 |     );
  162 |     await page.reload();
  163 |     await expect(page.locator(destino)).toBeVisible();
  164 |     await expect(page.getByRole("alert")).toHaveCount(0);
  165 |     await outra.getByRole("button", { name: "Sair", exact: true }).click();
  166 |     await entrarComo(outra, "Jessica");
  167 |     expect((await outra.request.get(`/quadros/${quadroId}`)).status()).toBe(
  168 |       403,
  169 |     );
  170 |     expect((await outra.request.get("/?visualizacao=kanban")).status()).toBe(
```