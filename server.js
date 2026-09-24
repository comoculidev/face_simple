const express=require("express"),multer=require("multer"),path=require("path"),fs=require("fs"),cors=require("cors");
const app=express(),PORT=3000,FACES_DIR=path.join(__dirname,"faces");
fs.mkdirSync(FACES_DIR,{recursive:true});app.use(cors());app.use(express.json());app.use(express.static(__dirname));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024},fileFilter:(req,file,cb)=>file.mimetype.startsWith("image/")?cb(null,true):cb(new Error("Yalnız şəkil göndərilə bilər."))});
function safe(v){return String(v||"").trim().replace(/[<>:"/\\|?*\x00-\x1F]/g,"").replace(/\s+/g,"_").replace(/\.+$/g,"")}
app.post("/api/persons",upload.single("photo"),(req,res)=>{
 try{
  if(!req.file)return res.status(400).json({success:false,message:"Şəkil göndərilməyib."});
  const {firstName,lastName,department,position}=req.body;
  if(!firstName||!lastName||!department||!position)return res.status(400).json({success:false,message:"Bütün xanaları doldurun."});
  const base=[firstName,lastName,department,position].map(safe).filter(Boolean).join("_");
  let fileName=base+".jpeg",n=2;
  while(fs.existsSync(path.join(FACES_DIR,fileName)))fileName=base+"_"+n+++".jpeg";
  fs.writeFileSync(path.join(FACES_DIR,fileName),req.file.buffer);
  const metadata={ad:String(firstName).trim(),soyad:String(lastName).trim(),strukturBolmesi:String(department).trim(),vezife:String(position).trim(),sekil:fileName,tarix:new Date().toISOString()};
  fs.writeFileSync(path.join(FACES_DIR,fileName.replace(".jpeg",".json")),JSON.stringify(metadata,null,2),"utf8");
  res.json({success:true,file:fileName});
 }catch(e){console.error(e);res.status(500).json({success:false,message:"Server xətası baş verdi."})}
});
app.listen(PORT,()=>console.log("Sayt: http://localhost:"+PORT));
