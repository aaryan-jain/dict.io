import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { WordsDataSource } from './WordsDataSource';
import { DictionaryService } from './dictionary.service';
import { BehaviorSubject, mergeMap } from 'rxjs';
import WordData from './WordDTO';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate(1000)),
    ]),
    trigger('EnterLeave', [
      state('flyIn', style({})),
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('1s ease-out'),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  private loading = new BehaviorSubject<boolean>(false);
  public loadingObs = this.loading.asObservable();

  wordListener = new FormControl('', [Validators.required]);

  wordToBeUpdated = -1;
  dataSource: WordsDataSource;

  columns = ['word', 'edit', 'delete'];

  constructor(
    private dictionaryService: DictionaryService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource = new WordsDataSource(this.dictionaryService);
    this.loading.next(true);
    this.dataSource.loadWords();
    this.dataSource.loadingObs.subscribe((loading) =>
      this.loading.next(loading)
    );
    this.wordChanged();
  }

  edit(wordArg: WordData) {
    this.wordToBeUpdated = wordArg.id;
    this.wordListener.setValue(wordArg.word);
  }

  onDelete(wordArg: WordData) {
    this.wordListener.markAsUntouched();
    this.loading.next(true);
    this.dictionaryService.deleteWordFromServer(wordArg).subscribe({
      next: (result) => {
        this.loading.next(false);
        this.dialog.open(ResultDialog, {
          data: {
            message: result,
            result: 'Success!',
          },
        });
        this.dataSource.loadWords();
        this.reset();
      },
      error: (err) => {
        this.loading.next(false);
        console.log(err);
        this.dialog.open(ResultDialog, {
          data: {
            message: err,
            result: 'Error!!',
          },
        });
        this.reset();
      },
    });
  }

  onSave() {
    if (!this.wordListener.value) {
      this.wordListener.markAsTouched();
      return;
    }
    if (this.wordListener.value.length === 0) {
      return;
    }

    this.loading.next(true);
    this.dictionaryService
      .saveWord({
        update: this.wordToBeUpdated,
        word: this.wordListener.value,
      })
      .subscribe({
        next: (result) => {
          this.loading.next(false);
          console.log(result);
          this.dialog.open(ResultDialog, {
            data: {
              message: result.error ? 'check word again.' : result.message,
              result: result.error ? 'Error!!' : 'Success!!',
            },
          });
          this.dataSource.loadWords();
          this.wordToBeUpdated = -1;
          this.wordListener.reset();
        },
        error: (err) => {
          this.dataSource.loadWords();
          this.wordToBeUpdated = -1;
          this.wordListener.reset();

          this.loading.next(false);
          this.dialog.open(ResultDialog, {
            data: {
              message: err,
              result: 'ErrOR!!',
            },
          });
        },
      });
  }

  // FUNCTION TO CAPTURE VALUE OF INPUT AS SOON AS IT CHANGES, USE IT LATER TO FILTER WORDS FROM THE TABLE
  wordChanged() {
    this.wordListener.valueChanges.subscribe((inputVal) => {
      if (inputVal) {
        this.dataSource.loadFilteredWords(inputVal);
        if (inputVal.length === 0) this.wordListener.reset();
      }
    });
  }

  reset() {
    this.wordListener.reset();
    this.wordToBeUpdated = -1;
    this.dataSource.loadWords();
  }
}

@Component({
  selector: 'result-dialog',
  template: ` <div
    style="height:10rem;  width:20rem; display:flex; flex-direction:column; justify-content:space-between;"
  >
    <h1 mat-dialog-title>{{ data.result }}</h1>
    <div mat-dialog-content>{{ data.message }}</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close (click)="close()">Close</button>
    </div>
  </div>`,
})
export class ResultDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string; result: string },
    private dialogRef: MatDialogRef<ResultDialog>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
