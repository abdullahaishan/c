import React, { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"

import {
LayoutDashboard,
FolderKanban,
Award,
Briefcase,
GraduationCap,
Settings,
LogOut,
Menu,
User,
Code,
ChevronDown,
Bell,
Sparkles,
Crown,
MessageSquare,
Share2,
Check
} from "lucide-react"

const DashboardLayout = () => {

const location = useLocation()
const navigate = useNavigate()

const [sidebarOpen,setSidebarOpen] = useState(false)
const [profileMenuOpen,setProfileMenuOpen] = useState(false)

const [developer,setDeveloper] = useState(null)
const [loading,setLoading] = useState(true)

const [notificationsCount,setNotificationsCount] = useState(0)

const [copied,setCopied] = useState(false)
const [showShareTooltip,setShowShareTooltip] = useState(false)

const navigation = [

{ name:"Overview",href:"/dashboard",icon:LayoutDashboard },

{ name:"Projects",href:"/dashboard/projects",icon:FolderKanban },

{ name:"Skills",href:"/dashboard/skills",icon:Code },

{ name:"Certificates",href:"/dashboard/certificates",icon:Award },

{ name:"Experience",href:"/dashboard/experience",icon:Briefcase },

{ name:"Education",href:"/dashboard/education",icon:GraduationCap },

{ name:"Messages",href:"/dashboard/messages",icon:MessageSquare },

{ name:"AI Builder",href:"/app/builder",icon:Sparkles },

{ name:"Plan Status",href:"/dashboard/plan-status",icon:Crown },

{ name:"Settings",href:"/dashboard/settings",icon:Settings }

]

const isActive = (path)=> location.pathname === path

const fetchDeveloperData = async ()=>{

try{

const {data:{user}} = await supabase.auth.getUser()

if(!user) return

const {data,error} = await supabase

.from("developers")

.select("*")

.eq("id",user.id)

.single()

if(error){

console.error(error)

return

}

setDeveloper(data)

fetchNotifications(data.id)

}catch(err){

console.error(err)

}

}

const fetchNotifications = async (developerId)=>{

try{

const {count,error} = await supabase

.from("notifications")

.select("*",{count:"exact",head:true})

.eq("user_id",developerId)

.eq("is_read",false)

if(!error){

setNotificationsCount(count || 0)

}

}catch(err){

console.error(err)

}

}

useEffect(()=>{

const load = async ()=>{

setLoading(true)

await fetchDeveloperData()

setLoading(false)

}

load()

const interval = setInterval(()=>{

if(developer?.id){

fetchNotifications(developer.id)

}

},30000)

return ()=> clearInterval(interval)

},[])

const copyPortfolioLink = ()=>{

if(!developer?.username) return

const url = "${window.location.origin}/u/${developer.username}"

navigator.clipboard.writeText(url)

setCopied(true)

setTimeout(()=> setCopied(false),2000)

}

const logout = async ()=>{

await supabase.auth.signOut()

navigate("/")

}

return (

<div className="min-h-screen bg-[#030014]">{sidebarOpen && (

<divclassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"

onClick={()=>setSidebarOpen(false)}

/>

)}

<divclassName={"fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-50 lg:translate-x-0 ${sidebarOpen ? "translate-x-0":"-translate-x-full"}"}

«»

<div className="h-16 flex items-center justify-center border-b border-white/10"><Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center"><span className="text-white font-bold">P</span>

</div><span className="text-xl font-bold text-white">Portfolio<span className="text-[#a855f7]">V5</span>

</span></Link></div><nav className="p-4 space-y-1">{navigation.map((item)=>{

const Icon = item.icon

const isMessagesPage = item.href === "/dashboard/messages"

return (

<Linkkey={item.name}

to={item.href}

className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive(item.href)

? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white"

: "text-gray-400 hover:bg-white/5 hover:text-white"

}`}

onClick={()=>setSidebarOpen(false)}

«»

<Icon className="w-5 h-5"/><span>{item.name}</span>

{isMessagesPage && notificationsCount>0 && (

<span className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">{notificationsCount>9?"9+":notificationsCount}

</span>)}

</Link>)

})}

</nav><div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10"><div className="flex items-center gap-3">{loading ? (

<div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"/>):(

<img

src={developer?.profile_image || "/default-avatar.png"}

className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"

onError={(e)=>{e.target.src="/default-avatar.png"}}

/>

)}

<div className="flex-1 min-w-0">{loading ? (

<>

<div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"/><div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"/></>

):(

<>

<p className="text-sm font-medium text-white truncate">{developer?.full_name || "User"}

</p><p className="text-xs text-gray-400 truncate">{developer?.email}

</p></>

)}

</div></div></div></div><div className="lg:pl-64"><header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10"><div className="flex items-center justify-between h-16 px-4"><button

onClick={()=>setSidebarOpen(true)}

className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"

«»

<Menu className="w-6 h-6"/></button><div className="flex items-center gap-4 ml-auto"><div className="relative"><button

onClick={copyPortfolioLink}

onMouseEnter={()=>setShowShareTooltip(true)}

onMouseLeave={()=>setShowShareTooltip(false)}

className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"

«»

{copied ? (

<Check className="w-5 h-5 text-green-400"/>):(

<Share2 className="w-5 h-5"/>)}

</button>{showShareTooltip && !copied && (

<div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg">مشاركة الموقع

</div>)}

{copied && (

<div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg">تم نسخ الرابط

</div>)}

</div><button

className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"

«»

<Bell className="w-5 h-5"/>{notificationsCount>0 && (

<span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">{notificationsCount>9?"9+":notificationsCount}

</span>)}

</button><div className="relative"><button

onClick={()=>setProfileMenuOpen(!profileMenuOpen)}

className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"

«»

<img

src={developer?.profile_image || "/default-avatar.png"}

className="w-8 h-8 rounded-full object-cover"

/>

<span className="hidden sm:block text-sm">{developer?.full_name?.split(" ")[0]}

</span><ChevronDown className="w-4 h-4"/></button>{profileMenuOpen && (

<div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50"><Linkto={"/u/${developer?.username}"}

className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"

«»

<User className="w-4 h-4"/>عرض الملف الشخصي

</Link><button

onClick={logout}

className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"

«»

<LogOut className="w-4 h-4"/>تسجيل خروج

</button></div>)}

</div></div></div></header><main className="p-6"><Outlet/></main></div></div>)

}

export default DashboardLayout
