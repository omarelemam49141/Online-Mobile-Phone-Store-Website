import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ImageService } from '../services/image-service.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  constructor(private imageService: ImageService){}

  @Input() imageUrl = null;
  @Output() imageEvent = new EventEmitter<string>();

  processFile(event: any) {
    this.convertFile(event.target.files[0]).subscribe(base64 => {
      this.imageUrl = base64;
      this.imageUrl = 'data:image/jpg;base64,' + this.imageUrl;
      this.imageEvent.emit(this.imageUrl);
    });
  }
  
  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  ngOnInit(): void {
  }
}
