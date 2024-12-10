import { Component, OnInit , Input, Output, HostListener, OnChanges, HostBinding, ChangeDetectionStrategy, 
  SimpleChanges,EventEmitter, AfterViewInit, AfterViewChecked, AfterContentChecked, Inject, LOCALE_ID} from '@angular/core';
import { CommonModule,  DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup,UntypedFormControl, FormControl, Validators, FormBuilder, FormArray} from '@angular/forms';

import { fnExtractParam, fnProcessScript } from "./scriptFns";
import { classMainFile , classStructure, classDetails, classTabLevel0, classTabLevel1, classTabLevel2, classTabLevel3, classTabLevel4} from "../kiosk-abd-config/exportClassMasterCONFIG";
import { classMainOutFile , classOutStructure, classOutDetails, classOutTabLevel0, classOutTabLevel1, classOutTabLevel2, classOutTabLevel3, classOutTabLevel4} from "../kiosk-abd-config/exportClassMasterCONFIG";

import { classSubConf, classReplace, classFilterParam, classChangeField, classDataScript } from "./classScriptFns";

import { convertScriptToJson } from "./scriptFns"

@Component({
  selector: 'app-script-mgt',
  templateUrl: './script-mgt.component.html',
  styleUrl: './script-mgt.component.css',
  standalone: true, 
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
})
export class ScriptMgtComponent {

  @Input() isMainJson:boolean=false;;
  @Input() afterSaveScript:any;

  @Output() saveScript= new EventEmitter<any>();
  @Output() processScript= new EventEmitter<any>();

  myForm: FormGroup = new FormGroup({
    fileScriptName: new FormControl('script001', { nonNullable: true }),
  })

  scriptFn:Array<any>=["<#domain ","<#select ","<#filter ","<#replace "];

  scriptFileName:Array<string>=[];
  scriptFileContent:Array<string>=[];
  currentScript:number=0;
  scriptJsonContent:Array<classDataScript>=[];

  isScriptRetrieved:boolean=false;
  isConfirmSaveScript:boolean=false;
  modifiedScriptContent:string="";
  scriptError:string='';


  //dataScript=new classDataScript;
  tagFilterDisp=new classFilterParam;

  nl:string="\n";

  ngOnInit(){
    const classA=new classDataScript;
    this.scriptJsonContent.push(classA);
    this.initDataScript(this.scriptJsonContent[0]);

    this.tagFilterDisp.tagConf=this.scriptJsonContent[0].filter.tagConf;
    this.tagFilterDisp.fieldConf[0]="";

    const filterP=new classSubConf;
    this.tagFilterDisp.subConf.push(filterP);    
    this.tagFilterDisp.subConf[0].field[0]="";
    this.scriptJsonContent[this.currentScript]
    this.currentScript=0;
    this.scriptFileContent[0]="";
    this.scriptFileName[0]="Script Guided Mode";
    this.buildGuided();
    this.modifiedScriptContent=this.scriptFileContent[0];
  }

  initDataScript(tab:classDataScript){
    
    tab.filter.tagConf="<ABDConfig ";
    tab.filter.fieldConf[0]="";
    const filterA=new classSubConf;
    tab.filter.subConf.push(filterA);
    tab.filter.subConf[0].field[0]="";
    const replace=new classReplace;
    tab.replace.push(replace);
    const change=new classChangeField;
    tab.replace[0].changeField.push(change);
  }

  onClearScript(){
    this.modifiedScriptContent="";
  }

  isGuidedMode:boolean=false;

  onStartGuided(){
    this.tagFilterDisp.subConf.splice(0,this.tagFilterDisp.subConf.length);
    this.isGuidedMode=true;

    this.tagFilterDisp.tagConf=this.scriptJsonContent[this.currentScript].filter.tagConf;
    for (var iDet=0; iDet<this.scriptJsonContent[this.currentScript].filter.fieldConf.length; iDet++){
      this.tagFilterDisp.fieldConf[iDet]=this.scriptJsonContent[this.currentScript].filter.fieldConf[iDet];
    }
    for (var j=0; j<this.scriptJsonContent[this.currentScript].filter.subConf.length; j++){
      const filterA=new classSubConf;
      this.tagFilterDisp.subConf.push(filterA);
      this.tagFilterDisp.subConf[j].tag=this.scriptJsonContent[this.currentScript].filter.subConf[j].tag;
      this.tagFilterDisp.subConf[j].subTag=this.scriptJsonContent[this.currentScript].filter.subConf[j].subTag;
      for (var iDet=0; iDet<this.scriptJsonContent[this.currentScript].filter.subConf[j].field.length; iDet++){
        this.tagFilterDisp.subConf[j].field[iDet]=this.scriptJsonContent[this.currentScript].filter.subConf[j].field[iDet];
      }
    }
  }

  onStopGuided(){
    this.isGuidedMode=false;
    this.buildGuided();
    this.modifiedScriptContent=this.scriptFileContent[this.currentScript];

  } 

  onProcessScript(){
    this.scriptError="";
    //if (this.scriptJsonContent[this.currentScript].dom.field==="" || this.scriptJsonContent[this.currentScript].dom.value===""){
    if (this.isGuidedMode===false){  
      const response=convertScriptToJson(this.modifiedScriptContent, this.scriptFn);
      if (response.status !==undefined && response.status===200 && response.tab!==undefined){
        this.scriptJsonContent[this.currentScript]=response.tab;
      } else if (response.msg !==undefined){
        this.scriptError = response.msg;
      }
   // }
   // if (this.currentScript===0){
    } else {
      this.buildGuided();
      this.modifiedScriptContent=this.scriptFileContent[this.currentScript];
    }
    //}
    
    if (this.scriptError===""){
      this.processScript.emit(this.scriptJsonContent[this.currentScript]);
    }
  }

  onInputScript(event:any){
    this.modifiedScriptContent=event.target.value;
  }

  onDomainInput(event:any){
    if (event.target.id==="domField"){
      this.scriptJsonContent[this.currentScript].dom.field=event.target.value;
    } else if (event.target.id==="domValue"){
      this.scriptJsonContent[this.currentScript].dom.value=event.target.value;
    }
  }

  onSelectInput(event:any){
    if (event.target.id==="selTag"){
      this.scriptJsonContent[this.currentScript].select.tag=event.target.value;
    } else if (event.target.id==="selField"){
      this.scriptJsonContent[this.currentScript].select.field=event.target.value;
    } else if (event.target.id==="selFromV"){
      this.scriptJsonContent[this.currentScript].select.fromValue=event.target.value;
    } if (event.target.id==="selToV"){
      this.scriptJsonContent[this.currentScript].select.toValue=event.target.value;
    }
  }

  onSelectedScript(event:any){
    //if (this.currentScript===0){
    // this.buildGuided();
    //}
  
    this.currentScript=event;
    this.scriptError="";
    this.modifiedScriptContent=this.scriptFileContent[this.currentScript];
    const saveGuided=this.isGuidedMode;
    this.onStartGuided();
    this.isGuidedMode=saveGuided;
  }
  
  buildGuided(){
    
    this.scriptFileContent[this.currentScript]="<!-- function '<#domain' is mandatory to run a script" + this.nl + " the functions currently available are '<#select', '<#filter', '<#replace' " +
    + this.nl + "the end of a function is specified with the 2 following characters: '#>' " + "--> " + this.nl + 
    '<#domain field="'+this.scriptJsonContent[this.currentScript].dom.field+ '" value="' + this.scriptJsonContent[this.currentScript].dom.value+'" #>'+ this.nl ;
    if (this.scriptJsonContent[this.currentScript].select.tag!==""){
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl +  '<#select tag="' + this.scriptJsonContent[this.currentScript].select.tag + '" field="' + this.scriptJsonContent[this.currentScript].select.field + '" fromValue="' +
      this.scriptJsonContent[this.currentScript].select.fromValue + '" toValue="' + this.scriptJsonContent[this.currentScript].select.toValue + '" #>' + this.nl;
    }
    
    if (this.scriptJsonContent[this.currentScript].filter.subConf.length>0){
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript]+ this.nl + '<#filter ';
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl + '[tag="' + this.scriptJsonContent[this.currentScript].filter.tagConf +  '" field="'
      for (var iDet=0; iDet<this.scriptJsonContent[this.currentScript].filter.fieldConf.length; iDet++){
        this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.scriptJsonContent[this.currentScript].filter.fieldConf[iDet];
        if (iDet<this.scriptJsonContent[this.currentScript].filter.fieldConf.length-1){
          this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + ', ';
        }
      }
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] +'"]';

      for (var i=0; i<this.scriptJsonContent[this.currentScript].filter.subConf.length; i++){
        this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl + '[tag="' + this.scriptJsonContent[this.currentScript].filter.subConf[i].tag ;
        if (this.scriptJsonContent[this.currentScript].filter.subConf[i].subTag!==""){
          this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + '" field=""]' + this.nl +  '[tag="' + this.scriptJsonContent[this.currentScript].filter.subConf[i].subTag
        }
        this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] +  '" field="';

        for (var iDet=1; iDet<this.scriptJsonContent[this.currentScript].filter.subConf[i].field.length; iDet++){
          this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.scriptJsonContent[this.currentScript].filter.subConf[i].field[iDet];
          if (iDet<this.scriptJsonContent[this.currentScript].filter.subConf[i].field.length-1){
            this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + ', ';
          }
        }
        this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + '"] ';
      }
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl + ' #> ';
    }
    
    if (this.scriptJsonContent[this.currentScript].replace.length>0 && this.scriptJsonContent[this.currentScript].replace[0].tag!==""){
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl + this.nl + "<#replace" ;
      for (var i=0; i<this.scriptJsonContent[this.currentScript].replace.length; i++){
        this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl +  '[tag="'+ this.scriptJsonContent[this.currentScript].replace[i].tag + '" refField="' +
          this.scriptJsonContent[this.currentScript].replace[i].refField +  '" withValue="' + this.scriptJsonContent[this.currentScript].replace[i].withValue + '" ' + this.nl +
          'changeField="';
          for (var j=0; j<this.scriptJsonContent[this.currentScript].replace[i].changeField.length; j++){
            this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.openTag + this.scriptJsonContent[this.currentScript].replace[i].changeField[j].tag + 
            "', old:'" + this.scriptJsonContent[this.currentScript].replace[i].changeField[j].old + "', new:'" + this.scriptJsonContent[this.currentScript].replace[i].changeField[j].new + this.closeTag ;
            if (j<this.scriptJsonContent[this.currentScript].replace[i].changeField.length-1){
              this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + ', ';
            }
          }
          this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + '" ]';
      }
      this.scriptFileContent[this.currentScript]=this.scriptFileContent[this.currentScript] + this.nl + '#>';
    }
    
  }



  onFilterScript(event:any){
    var iTab=0;
    var jTab=0;
    const tagConf="tagConf";
    const fieldConf="fieldConf-";
    const subConf={
      tag:"tagSubC-",
      subTag:"subTagSubC-",
      field:"fieldSubC-",
    }
    

    if (event.target.id.substring(0,tagConf.length)===tagConf){
      this.scriptJsonContent[this.currentScript].filter.tagConf=event.target.value;
    } else if (event.target.id.substring(0,fieldConf.length)===fieldConf){
      iTab=Number(event.target.id.substring(fieldConf.length));
      this.scriptJsonContent[this.currentScript].filter.fieldConf[iTab]=event.target.value;
    } else if (event.target.id.substring(0,subConf.tag.length)===subConf.tag){
      iTab=Number(event.target.id.substring(subConf.tag.length));
      this.scriptJsonContent[this.currentScript].filter.subConf[iTab].tag=event.target.value;
    } else if (event.target.id.substring(0,subConf.subTag.length)===subConf.subTag){
      iTab=Number(event.target.id.substring(subConf.subTag.length));
      this.scriptJsonContent[this.currentScript].filter.subConf[iTab].subTag=event.target.value;
    } else if (event.target.id.substring(0,subConf.field.length)===subConf.field){
      const j=event.target.id.indexOf("*");
      if (j!==-1){
        iTab=Number(event.target.id.substring(subConf.field.length, j));
        jTab=Number(event.target.id.substring(j+1));
        this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field[jTab]=event.target.value;
      }
    }
  }


  addField(event:any){
    const idConf="addConf";
    const idSubConf="addSubConf-";
    if (event.target.id.substring(0,idConf.length)===idConf){
      const k=this.scriptJsonContent[this.currentScript].filter.fieldConf.length;
      this.scriptJsonContent[this.currentScript].filter.fieldConf[k]="";
      this.tagFilterDisp.fieldConf[k]="";
    } else if (event.target.id.substring(0,idSubConf.length)===idSubConf){
        const iTab=Number(event.target.id.substring(idSubConf.length));
        const k=this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field.length;
        this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field[k]="";
        this.tagFilterDisp.subConf[iTab].field[k]="";
    }
  }

  delField(event:any){
    var jTab=0;
    const idConf="delConf-";
    const idSubConf="delSubConf-";
    
    if (event.target.id.substring(0,idConf.length)===idConf){
      const iTab=Number(event.target.id.substring(idConf.length));
      this.fnDelField(this.scriptJsonContent[this.currentScript].filter.fieldConf,this.tagFilterDisp.fieldConf,iTab);
      for (var k=iTab; k<this.scriptJsonContent[this.currentScript].filter.fieldConf.length; k++){
        this.tagFilterDisp.fieldConf[k]=this.scriptJsonContent[this.currentScript].filter.fieldConf[k];
      }
    } else if (event.target.id.substring(0,idSubConf.length)===idSubConf){
        const j=event.target.id.indexOf("*");
        jTab=Number(event.target.id.substring(j+1));
        if (j!==-1){
          const iTab=Number(event.target.id.substring(idSubConf.length,j));
          this.fnDelField(this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field,this.tagFilterDisp.subConf[iTab].field,jTab);
          for (var k=jTab; k<this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field.length; k++){
            this.tagFilterDisp.subConf[iTab].field[k]=this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field[k];
          }
        }
    }
  }

  fnDelField(tab:any, tabDisp:any, iDet:number){
    if (tab.length===1){
      tab[0]="";
      tabDisp[0]="";
    } else {
      tab.splice(iDet,1);
      tabDisp.splice(iDet,1);
    }

  }

  addTag(event:any){
    const idTag="addTag-"
    const iTab=Number(event.target.id.substring(idTag.length));
    const filterA=new classSubConf;
    this.scriptJsonContent[this.currentScript].filter.subConf.push(filterA);
    const filterB=new classSubConf;
    this.tagFilterDisp.subConf.push(filterA);
  }

  delTag(event:any){
    const idTag="delTag-"
    const iTab=Number(event.target.id.substring(idTag.length));    
    if (this.scriptJsonContent[this.currentScript].filter.subConf.length===1){
      this.scriptJsonContent[this.currentScript].filter.subConf[iTab].tag="";
      this.scriptJsonContent[this.currentScript].filter.subConf[iTab].subTag="";
      this.scriptJsonContent[this.currentScript].filter.subConf[iTab].field[0]=""; // delete all other items
      this.tagFilterDisp.subConf[iTab].tag="";
      this.tagFilterDisp.subConf[iTab].subTag="";
      this.tagFilterDisp.subConf[iTab].field[0]="";
    } else {
      this.scriptJsonContent[this.currentScript].filter.subConf.splice(iTab,1);
      this.tagFilterDisp.subConf.splice(iTab,1);
    }
    
  }

  onReplaceInput(event:any){
    var iTab=0;
    var jTab=0;
    
    if (event.target.id.substring(0,5)==="tagN-"){
      iTab=Number(event.target.id.substring(5));
      this.scriptJsonContent[this.currentScript].replace[iTab].tag=event.target.value;
    } else if (event.target.id.substring(0,5)==="tagF-"){
      iTab=Number(event.target.id.substring(5));
      this.scriptJsonContent[this.currentScript].replace[iTab].refField=event.target.value;
    } else if (event.target.id.substring(0,5)==="tagV-"){
      iTab=Number(event.target.id.substring(5));
      this.scriptJsonContent[this.currentScript].replace[iTab].withValue=event.target.value;
    } else {
      const j=event.target.id.indexOf("*");
      if (j!==-1){
        const id = "changeT-";
        jTab=Number(event.target.id.substring(j+1));
        iTab=Number(event.target.id.substring(id.length,j));
        
        if (event.target.id.substring(0,id.length)==="changeT-"){
          this.scriptJsonContent[this.currentScript].replace[iTab].changeField[jTab].tag=event.target.value;
        } else if (event.target.id.substring(0,id.length)==="changeO-"){
          this.scriptJsonContent[this.currentScript].replace[iTab].changeField[jTab].old=event.target.value;
        } else if (event.target.id.substring(0,id.length)==="changeN-"){
          this.scriptJsonContent[this.currentScript].replace[iTab].changeField[jTab].new=event.target.value;
        }
      }
    }
  }

  addChange(event:any){
    const idN="changeAdd-";
    const j=event.target.id.indexOf("*");
    if (j!==-1){
        const jTab=Number(event.target.id.substring(j+1));
        const iTab=Number(event.target.id.substring(idN.length,j));
        const change=new classChangeField;
        this.scriptJsonContent[this.currentScript].replace[iTab].changeField.splice(jTab+1,0,change);
    }
  }

  openTag="{tag:'";
  closeTag="'}";
  delChange(event:any){
    const idN="changeDel-";
    const j=event.target.id.indexOf("*");
    if (j!==-1){
      if (j!==-1){
        const jTab=Number(event.target.id.substring(j+1));
        const iTab=Number(event.target.id.substring(idN.length,j));
        this.scriptJsonContent[this.currentScript].replace[iTab].changeField.splice(jTab,1);
        if (this.scriptJsonContent[this.currentScript].replace[iTab].changeField.length===0){
          const change=new classChangeField;
          this.scriptJsonContent[this.currentScript].replace[iTab].changeField.push(change);
        }
      }
    }
  }

  addReplace(event:any){
    const idN="replaceAdd-";
    const iTab=Number(event.target.id.substring(idN.length));
    const replace=new classReplace;
    this.scriptJsonContent[this.currentScript].replace.splice(iTab+1,0,replace);
    const change=new classChangeField;
    this.scriptJsonContent[this.currentScript].replace[iTab+1].changeField.push(change);
  }

  delReplace(event:any){
    const idN="replaceDel-";
    const iTab=Number(event.target.id.substring(idN.length));
    this.scriptJsonContent[this.currentScript].replace.splice(iTab,1);
    if (this.scriptJsonContent[this.currentScript].replace.length===0){
      const replace=new classReplace;
      this.scriptJsonContent[this.currentScript].replace.push(replace);
      const change=new classChangeField;
      this.scriptJsonContent[this.currentScript].replace[0].changeField.push(change);
    }
  }

  confirmSaveScript(){
    this.scriptError="";
    if (this.isGuidedMode===true){
      this.buildGuided();
      this.modifiedScriptContent=this.scriptFileContent[this.currentScript];
    }
    this.isConfirmSaveScript=true;
    if (this.currentScript>-1){
      this.myForm.controls['fileScriptName'].setValue(this.scriptFileName[this.currentScript]);
    }
  }

  onSaveScript(event:any){
    this.scriptError="";
    if (event!=="cancel"){
      // check if the name already exists otherwise create one

      for (var i=0; i<this.scriptFileContent.length &&  this.scriptFileName[i]!==this.myForm.controls['fileScriptName'].value; i++){}
      if (i===this.scriptFileContent.length){
        this.currentScript=this.scriptFileContent.length;
      }
      this.scriptFileName[this.currentScript]=this.myForm.controls['fileScriptName'].value;
      this.scriptFileContent[this.currentScript]=this.modifiedScriptContent;
      const returnValue={
        action:event,
        file:this.myForm.controls['fileScriptName'].value,
        content:this.modifiedScriptContent
      }
      this.saveScript.emit(returnValue);
    } else {
      this.isConfirmSaveScript=false;
    }
  }

  onCancelScript(){
    this.modifiedScriptContent=this.scriptFileName[this.currentScript];
  }


  open(event: Event) { // used to upload file

    if (event.target instanceof HTMLInputElement && event.target.files!==undefined && event.target.files!==null && event.target.files.length > 0) {
          this.scriptFileName[this.scriptFileName.length]=event.target.files[0].name;
          this.myForm.controls['fileScriptName'].setValue(event.target.files[0].name);
          this.scriptFileContent[this.scriptFileContent.length]="";
          const reader = new FileReader();
          reader.onloadend = () => {
            this.isScriptRetrieved=true;
            this.scriptFileContent[this.scriptFileContent.length-1]=reader.result as string;
            this.currentScript=this.scriptFileContent.length-1;
            this.modifiedScriptContent=this.scriptFileContent[this.currentScript];

            const response=convertScriptToJson(this.modifiedScriptContent, this.scriptFn );
            if (response.status !==undefined && response.status===200 && response.tab!==undefined){
              const classA=new classDataScript;
              this.scriptJsonContent.push(classA);
              this.initDataScript(this.scriptJsonContent[this.currentScript]);
              this.scriptJsonContent[this.currentScript].dom=response.tab.dom;
              this.scriptJsonContent[this.currentScript].select=response.tab.select;
              if (response.tab.filter.tagConf!==undefined){
                this.scriptJsonContent[this.currentScript].filter=response.tab.filter;
              }
              if (response.tab.replace.length>0){
                this.scriptJsonContent[this.currentScript].replace=response.tab.replace;
              }
              const saveGuided=this.isGuidedMode;
              this.onStartGuided();
              this.isGuidedMode=saveGuided;
            } else if (response.msg !==undefined){
              this.scriptError = response.msg;
            }
          }
        reader.readAsText(event.target.files[0]);
      }
  }

  ngAfterContentChecked(){
    if (this.isConfirmSaveScript===true && this.afterSaveScript!==undefined){
      if (this.afterSaveScript.msg!==undefined){
        this.scriptError=this.afterSaveScript.msg;
        if (this.afterSaveScript.status==200){
            this.isConfirmSaveScript=false;
        } 
        this.afterSaveScript="";
      }
    }
    
  }
/*
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const j = changes[propName];
      if (propName === 'afterSaveScript' && changes[propName].firstChange === false) {
        
      }
    }
  }
*/

}