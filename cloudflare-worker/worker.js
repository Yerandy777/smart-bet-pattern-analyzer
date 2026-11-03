const API="https://v3.football.api-sports.io";
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"Content-Type"}})}
async function football(path,env){if(!env.API_FOOTBALL_KEY)throw new Error("API_FOOTBALL_KEY no está configurada en Cloudflare.");const r=await fetch(API+path,{headers:{"x-apisports-key":env.API_FOOTBALL_KEY}});const d=await r.json();if(!r.ok||d.errors&&Object.keys(d.errors).length)throw new Error(JSON.stringify(d.errors||d));return d.response||[]}
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
export default {async fetch(request,env){const url=new URL(request.url);if(request.method==="OPTIONS")return json({ok:true});try{
if(url.pathname==="/api/health"){return json({ok:true,service:"Smart Bet Pattern Analyzer API",provider:"API-Football",configured:!!env.API_FOOTBALL_KEY})}
if(url.pathname==="/api/match-search"&&request.method==="POST"){const body=await request.json();const {home,away,dateFrom,dateTo}=body;if(!home||!away||!dateFrom||!dateTo)return json({error:"Faltan equipos o intervalo de fechas."},400);if(dateFrom>dateTo)return json({error:"Intervalo de fechas inválido."},400);
const [ha,aa]=await Promise.all([football(`/teams?search=${encodeURIComponent(home)}`,env),football(`/teams?search=${encodeURIComponent(away)}`,env)]);
const h=ha.find(x=>norm(x.team.name)===norm(home))||ha[0],a=aa.find(x=>norm(x.team.name)===norm(away))||aa[0];if(!h||!a)return json({status:"NO_ENCONTRADO",detail:"No se identificó uno de los equipos. Revisa el nombre."});
const fixtures=await football(`/fixtures?team=${h.team.id}&from=${dateFrom}&to=${dateTo}&timezone=UTC`,env);
const matches=fixtures.filter(f=>(norm(f.teams.home.name)===norm(home)&&norm(f.teams.away.name)===norm(away))||(norm(f.teams.home.name)===norm(away)&&norm(f.teams.away.name)===norm(home)));
if(!matches.length)return json({status:"NO_ENCONTRADO",detail:"No se encontró un enfrentamiento exacto en esas fechas. Amplía el intervalo o revisa los nombres."});
if(matches.length>1)return json({status:"AMBIGUO",detail:"Se encontraron varios enfrentamientos. Reduce el intervalo de fechas.",matches:matches.map(f=>({date:f.fixture.date,home:f.teams.home.name,away:f.teams.away.name,score:f.goals,competition:f.league.name,status:f.fixture.status.short}))});
const f=matches[0],finished=["FT","AET","PEN"].includes(f.fixture.status.short);if(!finished)return json({status:"PENDIENTE",date:f.fixture.date,home:f.teams.home.name,away:f.teams.away.name,competition:f.league.name,fixtureStatus:f.fixture.status.short,detail:"El partido todavía no tiene resultado final."});
if(f.goals.home==null||f.goals.away==null)return json({status:"PENDIENTE",detail:"El proveedor todavía no publica el marcador final."});
return json({status:"FINALIZADO",date:f.fixture.date,home:f.teams.home.name,away:f.teams.away.name,competition:f.league.name,goals:{home:f.goals.home,away:f.goals.away},fixtureId:f.fixture.id});
}
return json({error:"Ruta no encontrada"},404);
}catch(e){return json({error:e.message||"Error del servidor"},500)}}};