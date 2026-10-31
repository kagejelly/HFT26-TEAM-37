import {NavLink,Outlet,useLocation,useParams} from 'react-router-dom';
import {Activity,ClipboardList,FileText,FolderOpen,LayoutDashboard,Plus,ShieldCheck,Menu,X,MousePointerClick} from 'lucide-react';
import {useEffect,useState} from 'react';
import {api} from '../../services/api';
import type {Investigation} from '../../types';

export default function AppLayout(){
  const {id,eventId}=useParams();
  const location=useLocation();
  const [caseItem,setCaseItem]=useState<Investigation|null>(null);
  const [mobileOpen,setMobileOpen]=useState(false);
  const selectedEventId=eventId || (location.state as {selectedEventId?:string}|null)?.selectedEventId || null;

  useEffect(()=>{
    if(id) api.getInvestigation(id).then(setCaseItem).catch(()=>setCaseItem(null));
    else setCaseItem(null);
  },[id,location.pathname]);

  const workspaceNav=[
    {to:'/app/dashboard',label:'Dashboard',icon:LayoutDashboard,end:true},
    {to:'/app/investigations/new',label:'New Investigation',icon:Plus,end:true}
  ];
  const caseNav=[
    {to:id?`/app/investigations/${id}`:'#',label:'Case Overview',icon:ClipboardList,end:true,enabled:!!id},
    {to:id?`/app/investigations/${id}/evidence`:'#',label:'Evidence Library',icon:FolderOpen,enabled:!!id},
    {to:id?`/app/investigations/${id}/timeline`:'#',label:'Forensic Timeline',icon:Activity,enabled:!!id},
    {to:id&&selectedEventId?`/app/investigations/${id}/events/${selectedEventId}`:'#',label:'Event Detail',icon:MousePointerClick,enabled:!!id&&!!selectedEventId,reason:!id?'Select an investigation first.':'Select an event from the forensic timeline first.'},
    {to:id?`/app/investigations/${id}/reconstruction`:'#',label:'Reconstruction',icon:ShieldCheck,enabled:!!id},
    {to:id?`/app/investigations/${id}/report`:'#',label:'Investigation Report',icon:FileText,enabled:!!id}
  ];
  const disabledReason='Select an investigation first.';
  const navState=selectedEventId?{selectedEventId}:undefined;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'mobile-open':''}`}>
      <div className="brand"><div className="brand-mark">E</div><div><strong>EVIDENTIA</strong><span>FORENSIC WORKSPACE</span></div><button className="mobile-close" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="side-caption">WORKSPACE</div>
      <nav aria-label="Workspace navigation">{workspaceNav.map(n=><NavLink key={n.to} to={n.to} end={n.end} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><n.icon size={17}/>{n.label}</NavLink>)}</nav>

      <div className="side-caption case-caption">INVESTIGATION PAGES</div>
      {id&&<div className="case-chip"><span className="case-dot"/><div><b>{caseItem?.title||'Loading case…'}</b><small>{id}</small></div></div>}
      {!id&&<div className="nav-helper">Select an investigation to unlock its workspace pages.</div>}
      <nav aria-label="Investigation navigation">
        {caseNav.map(n=> n.enabled ?
          <NavLink key={n.label} to={n.to} end={n.end} state={navState} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><n.icon size={17}/>{n.label}</NavLink>
          : <div key={n.label} className="nav-item nav-item-disabled" aria-disabled="true" title={n.reason||disabledReason}><n.icon size={17}/><span>{n.label}</span><span className="nav-lock-hint">{n.label==='Event Detail'?'Select event':'Select case'}</span></div>
        )}
      </nav>
      <div className="sidebar-bottom"><div className="secure-card"><div className="secure-icon"><ShieldCheck size={16}/></div><b>Evidence first.</b><p>Every observation stays connected to its source.</p></div><div className="profile-row"><div className="avatar">IN</div><div><b>Investigator</b><small>Local workspace</small></div><span className="online-dot"/></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="menu-toggle" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu size={19}/></button><div className="breadcrumb">Workspace <span>/</span> {location.pathname.includes('investigations')?'Investigations':'Dashboard'}{caseItem&&<><span>/</span>{caseItem.title}</>}</div><div className="topbar-right"><span className="environment"><i/> {import.meta.env.VITE_USE_MOCKS==='true'?'Sample workspace':'Connected workspace'}</span><div className="top-avatar">IN</div></div></header><div className="content"><Outlet/></div><footer className="footer"><span>© 2026 EVIDENTIA</span><span>Investigation support · Not a determination of fault</span></footer></main>
    {mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
  </div>;
}
