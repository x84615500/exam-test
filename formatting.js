/* The retained Word reference controls these values: 20 pt bold, A4, 567/566/567/993 twip margins. */
const EXAM_LAYOUT=Object.freeze({font:'新細明體',fontSize:20,pageWidth:11906,pageHeight:16838,marginTop:567,marginRight:566,marginBottom:567,marginLeft:993,hanging:1200,questionSpace:180,textColumns:51});
function questionText(q,i){return `${i+1}.（　）${q.text.trim()} *${q.original}`;}
function textWidth(character){return /[\u0020-\u007e\uff61-\uffdc]/u.test(character)?1:2;}
function wrapExamQuestion(q,i){
 const prefix=`${i+1}.（　）`,indent='      ',chars=Array.from(`${q.text.trim()} *${q.original}`),lines=[];
 let pos=0,first=true;
 while(pos<chars.length){
  const lead=first?prefix:indent;
  const available=EXAM_LAYOUT.textColumns-Array.from(lead).reduce((s,c)=>s+textWidth(c),0);
  let end=pos,width=0;
  while(end<chars.length&&width+textWidth(chars[end])<=available){width+=textWidth(chars[end]);end++;}
  // Keep closing punctuation away from the start of a continuation line.
  if(end<chars.length&&/[，。、；：？！）〕】」』〉》%]/u.test(chars[end])&&end>pos+1)end--;
  if(end===pos)end++;
  lines.push(lead+chars.slice(pos,end).join('').trimEnd());
  pos=end;while(chars[pos]===' ')pos++;first=false;
 }
 return lines.join('\r\n');
}
function buildExamText(questions){return '單選                         姓名：＿＿＿＿＿＿\r\n\r\n'+questions.map(wrapExamQuestion).join('\r\n\r\n')+'\r\n';}
function rtfEscape(text){let result='';for(let i=0;i<text.length;i++){const code=text.charCodeAt(i),ch=text[i];if(ch==='\\'||ch==='{'||ch==='}')result+='\\'+ch;else if(code>127)result+='\\u'+(code>32767?code-65536:code)+'?';else if(ch==='\n')result+='\\line ';else if(ch!=='\r')result+=ch;}return result;}
function buildExamRtf(questions){
 const l=EXAM_LAYOUT;
 const preamble=`{\\rtf1\\ansi\\ansicpg950\\deff0\\deflang1028\\uc1{\\fonttbl{\\f0\\froman\\fcharset136 ${rtfEscape(l.font)};}{\\f1\\fswiss Calibri;}}\\paperw${l.pageWidth}\\paperh${l.pageHeight}\\margt${l.marginTop}\\margr${l.marginRight}\\margb${l.marginBottom}\\margl${l.marginLeft}\\widowctrl`;
 const header=`\\pard\\ql\\f0\\fs40\\b\\cf0\\sl0\\slmult0\\sa0\\sb0\\tx7800 ${rtfEscape('單選')}\\tab ${rtfEscape('姓名：')}\\ul ${rtfEscape('　　　　　')}\\ulnone\\par\n`;
 const body=questions.map((q,i)=>`\\pard\\ql\\f0\\fs40\\b\\cf0\\sl0\\slmult0\\sb${i===0?0:l.questionSpace}\\sa0\\li${l.hanging}\\fi-${l.hanging}\\keep ${rtfEscape(questionText(q,i))}\\par\n`).join('');
 return preamble+'\n'+header+body+'}';
}
function downloadExam(content,type,filename){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

