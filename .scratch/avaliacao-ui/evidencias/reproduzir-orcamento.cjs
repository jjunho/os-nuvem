// Diagnóstico dos handlers reais com hooks/fetchers/JSX simulados; não é E2E.
const fs=require('fs'),vm=require('vm');
const esbuild=require(process.cwd()+'/node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild');
const root=process.env.UI_REVIEW_SOURCE||process.cwd();
const src=fs.readFileSync(root+'/app/routes/orcamento.tsx','utf8');
const code=esbuild.transformSync(src,{loader:'tsx',format:'cjs',jsx:'automatic'}).code;
let states=[],cursor=0,fetchCursor=0,effects=[];const fetchers=Array.from({length:3},()=>({state:'idle',Form:'form',submit(v){this.sent=v}}));
const cond={sinal:30,saldoDias:10,validadeDias:10,iva:0,incluso:'',naoIncluso:'',cancelamento:'',formasPagamento:'',dadosBancarios:'',notasB2B:'',generica:false,detalhe:'nenhum'};
const mod={exports:{}};
const mocks={'react':{useState(init){const k=cursor++;if(!(k in states))states[k]=init;return [states[k],v=>states[k]=typeof v==='function'?v(states[k]):v]},useEffect(fn){effects.push(fn)}},'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'},'react-router':{useFetcher:()=>fetchers[fetchCursor++],Link:'a'},'~/modules/idiomas/idioma':{useIdioma:()=>({t:s=>s,mensagem:s=>s,idioma:'pt'})},'~/modules/orcamentos/versoes':{condicoesPadrao:cond},'~/modules/opcoes/Seletor':{Seletor:'Seletor'}};
vm.runInNewContext(code,{module:mod,exports:mod.exports,require:n=>mocks[n]??{},structuredClone,console,crypto:globalThis.crypto});
const data={orcamento:{id:1,versao:1,revisao:1,dados:{categoria:'a',canal:'agencia',diaInicial:1,opcoes:[]}},pessoas:[],viagem:{id:1,codigo:'A',meiosContato:[]},opcoesConhecidas:{},destinatario:'A'};
function render(d=data){cursor=fetchCursor=0;effects=[];return mod.exports.default({loaderData:d})}
function nodes(n){if(!n||typeof n!=='object')return [];if(Array.isArray(n))return n.flatMap(nodes);return [n,...nodes(n.props?.children)]}
function button(tree,label){return nodes(tree).find(n=>n.type==='button'&&n.props.children===label)}
function field(tree,name){return nodes(tree).find(n=>n.props?.name===name)}
let tree=render();states[3]=true;tree=render();button(tree,'Salvar orçamento').props.onClick();fetchers[0].data={erro:'Informe o motivo do ajuste'};tree=render();console.log('failed save: altered=',states[3],'send disabled=',button(tree,'Registrar envio').props.disabled);
fetchers[2].data={pedido:{dias:1,cidades:['Seul'],pagantes:2,gratuidades:0}};tree=render();field(tree,'pedidoTexto').props.onChange({target:{value:'2030-01-01 7 pagantes Busan'}});tree=render();button(tree,'Confirmar pedido').props.onClick();console.log('preview 2 Seul -> confirm payload',fetchers[2].sent);
fetchers[0].data={revisao:5};tree=render({...data,orcamento:{...data.orcamento,id:2,revisao:1,dados:{...data.orcamento.dados,categoria:'B'}}});button(tree,'Salvar orçamento').props.onClick();console.log('param reuse category=',JSON.parse(fetchers[0].sent.dados).categoria,'revision=',fetchers[0].sent.revisao);
states[3]=true;fetchers[2].data={confirmado:true,dados:{...data.orcamento.dados,categoria:'SERVER'}};tree=render();effects.forEach(f=>f());console.log('pending confirm overwrites current draft=',states[2].categoria,'altered=',states[3]);
