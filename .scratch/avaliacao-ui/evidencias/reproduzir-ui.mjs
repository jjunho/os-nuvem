// Diagnóstico: afirma comportamentos defeituosos observados; não é teste de aceitação.
// Execute da raiz: EXPECT_REORDER_FIXED=1 node .scratch/avaliacao-ui/evidencias/reproduzir-ui.mjs
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const repo=process.cwd();
const snapshot=process.env.UI_REVIEW_SOURCE||repo;
const require=createRequire(repo+'/package.json');
const {build}=require(repo+'/node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild');
const {chromium}=require('playwright');
const dir=await mkdtemp(tmpdir()+'/corealux-ui-check-');
for(const [file,name] of [['quadro','Quadro'],['tarefas','Tarefas'],['aceite','Aceite']]){
 const original=await readFile(`${snapshot}/app/routes/${file}.tsx`,'utf8');
 const body=original.slice(original.indexOf(`export default function ${name}`));
 await writeFile(`${dir}/${name}.tsx`, `import {useEffect,useState} from 'react';\nimport {Form,Link,useFetcher,useRevalidator} from 'react-router';\nconst useQuadrosTexto=()=>x=>x; const useIdioma=()=>({t:x=>x});\n`+body);
}
for(const rel of ['app/modules/opcoes/Seletor.tsx','app/modules/viagens/ContatoCampos.tsx']){
 let src=await readFile(snapshot+'/'+rel,'utf8');
 src=src.replace('import { useIdioma } from "~/modules/idiomas/idioma";', 'const useIdioma=()=>({t:x=>x});');
 src=src.replace('import { Seletor } from "~/modules/opcoes/Seletor";', 'import { Seletor } from "./Seletor";');
 await writeFile(dir+'/'+rel.split('/').at(-1),src);
}
await writeFile(dir+'/entry.tsx',`
import React from 'react'; import {createRoot} from 'react-dom/client';
import {createMemoryRouter,RouterProvider,useLoaderData} from 'react-router';
import Quadro from './Quadro'; import Tarefas from './Tarefas'; import Aceite from './Aceite'; import {Seletor} from './Seletor'; import {ContatoCampos} from './ContatoCampos';
window.EventSource=class{close(){}};
const listas=[{id:10,nome:'Novo',quadro_id:1,posicao:1,arquivada:false,conclusao:false},{id:20,nome:'Feito',quadro_id:1,posicao:2,arquivada:false,conclusao:true}];
const quadro={id:1,nome:'Teste',pessoal:true,criador_id:1,arquivado:false};
const usuarios=[{id:1,nome:'Carlos'},{id:2,nome:'Lia'}];
const tarefas=[1,2].map(id=>({id,lista_id:10,estado:'aberta',responsavel:'Carlos',prazo:null,etiquetas:[],cartao:{url:'/tarefas/'+id,titulo:'Tarefa '+id},viagem_id:null}));
window.actions=[]; window.reorderPending=false;
const versoes=[1,2].map(id=>({id,versao:id,memoria:{dados:{opcoes:[{id:'op'+id,nome:'Opcao '+id,pagantes:id,gratuidades:0}]}}}));
const router=createMemoryRouter([
 {path:'/aceite',loader:({request})=>({versoes,versao:versoes[Number(new URL(request.url).searchParams.get('versao')||1)-1],agora:'2026-09-25T00:00:00Z',vencida:false}),Component:()=> <Aceite loaderData={useLoaderData()}/>},
 {path:'/seletor',Component:()=> <><h1>Seletor</h1><Seletor nome="codigo" rotulo="Codigo" opcoes={[{valor:'a',nome:'Alpha'},{valor:'b',nome:'Beta'}]}/><button>Fora</button></>},
 {path:'/contato',Component:()=> <><h1>Contato</h1><form><ContatoCampos indice={0} contatos={[{id:99,nome:'Maria',email:'maria@example.test',telefone:'12345678'}]}/></form></>},
 {path:'/quadros/:id',loader:({request})=>({quadro,quadros:[quadro],listas,destinos:listas,tarefas,usuarios,usuario:{id:1,papel:'admin'},etiquetas:[],membros:[],filtros:Object.fromEntries(new URL(request.url).searchParams)}),
 action:async({request})=>{const f=Object.fromEntries(await request.formData());window.actions.push(f);if(f.intent==='mover'){window.reorderPending=true;await new Promise(resolve=>window.release=resolve);window.reorderPending=false;return {ok:true,error:''};}return new Response(JSON.stringify({ok:false,error:'Listas pessoais são protegidas'}),{status:400,headers:{'Content-Type':'application/json'}});},
 Component:()=> <Quadro loaderData={useLoaderData()}/>},
 {path:'/tarefas',loader:({request})=>({tarefas:[],usuarios,usuario:{id:1},filtros:Object.fromEntries(new URL(request.url).searchParams)}), Component:()=> <Tarefas loaderData={useLoaderData()}/>}
],{initialEntries:['/quadros/1']});
window.router=router; createRoot(document.getElementById('root')).render(<RouterProvider router={router}/>);
`);
await build({entryPoints:[dir+'/entry.tsx'],bundle:true,format:'iife',outfile:dir+'/bundle.js',jsx:'automatic',nodePaths:[repo+'/node_modules'],logLevel:'silent'});
const bundle=await readFile(dir+'/bundle.js');
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/bundle.js'?'application/javascript':'text/html');res.end(req.url==='/bundle.js'?bundle:'<div id="root"></div><script src="/bundle.js"></script>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage(); const results=[];
page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
try{
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.getByRole('heading',{name:'Teste',exact:true}).waitFor();
 const novo=page.getByTestId('lista-novo');
 await novo.locator('summary').filter({hasText:'Listas'}).click();
 await novo.getByRole('button',{name:'Arquivar',exact:true}).click();
 await page.waitForFunction(()=>window.actions.length===1 && window.router.state.navigation.state==='idle');
 assert.equal(await page.getByRole('alert').count(),0);
 assert.equal(await page.evaluate(()=>Object.values(window.router.state.actionData)[0].ok),false);
 results.push({case:'quadro: erro de Form normal',observed:'actionData.ok=false; nenhum alerta; lista permanece',confirmed:true});
 await page.evaluate(()=>window.router.navigate('/tarefas?responsavel=1'));
 await page.locator('select[name="responsavel"]').waitFor();
 await page.locator('select[name="responsavel"]').selectOption('2');
 await page.getByRole('button',{name:'Filtrar',exact:true}).click();
 await page.waitForFunction(()=>window.router.state.location.search.includes('responsavel=2')&&window.router.state.navigation.state==='idle');
 await page.evaluate(()=>window.router.navigate(-1));
 await page.waitForFunction(()=>window.router.state.location.search==='?responsavel=1');
 assert.equal(await page.locator('select[name="responsavel"]').inputValue(),'2');
 results.push({case:'tarefas: voltar no histórico',observed:'URL e loader responsavel=1; select ainda mostra 2',confirmed:true});
 await page.evaluate(()=>window.router.navigate('/quadros/1'));
 await page.getByRole('heading',{name:'Teste',exact:true}).waitFor();
 const tarefa2=page.locator('article').filter({has:page.getByRole('link',{name:'Tarefa 2',exact:true})});
 await tarefa2.locator('summary').click();
 await tarefa2.getByRole('button',{name:'Subir',exact:true}).click();
 await page.waitForFunction(()=>window.reorderPending);
 const order=await page.locator('article > a').allTextContents();
 assert.deepEqual(order,process.env.EXPECT_REORDER_FIXED?['Tarefa 2','Tarefa 1']:['Tarefa 1','Tarefa 2']);
 assert.equal((await page.evaluate(()=>window.actions.at(-1))).antesId,'1');
 results.push({case:'quadro: reordenação otimista',observed:process.env.EXPECT_REORDER_FIXED?'ordem visual 2,1 antes da resposta: correção concorrente verificada':'antesId=1 enviado para tarefa 2; ordem visual segue 1,2 durante operação',confirmed:true});
 await page.evaluate(()=>window.release());
 await page.evaluate(()=>window.router.navigate('/seletor'));
 await page.getByRole('heading',{name:'Seletor'}).waitFor();
 const combo=page.getByRole('combobox');
 await combo.focus();await combo.press('ArrowDown');await combo.press('ArrowDown');await combo.press('Enter');
 assert.equal(await page.locator('input[name="codigo"]').inputValue(),'b');
 await page.getByRole('button',{name:'Fora'}).click();await combo.focus();await combo.press('Enter');
 assert.equal(await page.locator('input[name="codigo"]').inputValue(),'Beta');
 results.push({case:'Seletor: refocar e Enter',observed:'código b substituído pelo rótulo Beta sem edição do texto',confirmed:true});
 await page.evaluate(()=>window.router.navigate('/contato'));
 await page.getByRole('heading',{name:'Contato',exact:true}).waitFor();
 await page.getByRole('combobox').focus();await page.getByRole('option',{name:'Maria — maria@example.test',exact:true}).click();
 await page.getByRole('combobox').fill('João');
 const formData=await page.locator('form').evaluate(f=>Object.fromEntries(new FormData(f)));
 assert.equal(formData['contatos.0.nome'],'João');assert.equal(formData['contatos.0.contatoId'],'');assert.equal(formData['contatos.0.email'],'maria@example.test');
 results.push({case:'Contato: abandonar seleção',observed:'payload nome João, contatoId vazio, email e telefone da Maria',confirmed:true});
 await page.evaluate(()=>window.router.navigate('/aceite?versao=1'));
 await page.getByRole('heading',{name:'Registrar aceite',exact:true}).waitFor();
 await page.getByLabel('Versão aceita',{exact:true}).selectOption('2');
 await page.waitForFunction(()=>window.router.state.location.search==='?versao=2'&&window.router.state.navigation.state==='idle');
 await page.evaluate(()=>window.router.navigate(-1));
 await page.waitForFunction(()=>window.router.state.location.search==='?versao=1');
 assert.equal(await page.getByLabel('Versão aceita',{exact:true}).inputValue(),'2');
 assert.equal(await page.locator('input[name="orcamentoId"]').inputValue(),'1');
 results.push({case:'Aceite: voltar no histórico',observed:'seletor exibe versão 2, URL e campo enviado usam versão 1',confirmed:true});
 console.log(JSON.stringify(results,null,2));
 await writeFile(dir+(process.env.EXPECT_REORDER_FIXED?'/results-current.json':'/results.json'),JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();server.close();}
