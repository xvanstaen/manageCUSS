import { Component, OnInit, ViewChild, AfterViewInit,SimpleChanges,
  Output, Input, HostListener, EventEmitter, ElementRef, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule,  DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup,UntypedFormControl, FormControl, Validators, FormBuilder, FormArray} from '@angular/forms';

import { SelectServerComponent } from './select-server/select-server.component';
import { KioskAbdConfigComponent } from './kiosk-abd-config/kiosk-abd-config.component';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from "@angular/router";

import { ManageGoogleService } from './CloudServices/ManageGoogle.service';
import { ManageMongoDBService } from './CloudServices/ManageMongoDB.service';
import { LoginIdentif , configServer, classUserLogin } from './JsonServerClass';
import { classCredentials} from './JsonServerClass';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, 
  imports:[RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule, KioskAbdConfigComponent, SelectServerComponent],
})

export class AppComponent {

  configServer=new configServer;
  identification=new LoginIdentif;
  credentials = new classCredentials;
  // development Mode
  devMode:string="local";
 
  isSelectServer:boolean=false;
  isSelectABD:boolean=true;

  ngOnInit(){

    this.configServer.userLogin.id="Geoffrey";
    this.configServer.userLogin.accessLevel="Low";

  }

}
