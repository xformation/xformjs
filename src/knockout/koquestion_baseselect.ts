import * as ko from "knockout";
import { QuestionImplementor } from "./koquestion";
import { Question } from "../question";
import {
  QuestionSelectBase,
  QuestionCheckboxBase
} from "../question_baseselect";

export class QuestionSelectBaseImplementor extends QuestionImplementor {
  koOtherVisible: any;
  protected onCreated() {}
  constructor(question: Question) {
    super(question);
    var self = this;

    this.koOtherVisible = ko.computed(function() {
      self.koValue();
      return self.isOtherSelected;
    });
    (<any>this.question)["koOtherVisible"] = this.koOtherVisible;
    this.onCreated();
  }
  protected get isOtherSelected(): boolean {
    return (<QuestionSelectBase>this.question).isOtherSelected;
  }
}
export class QuestionCheckboxBaseImplementor extends QuestionSelectBaseImplementor {
  constructor(question: Question) {
    super(question);
    (<any>this.question)["koAfterRender"] = this.koAfterRender;
  }
  private koAfterRender(el: any, con: any) {
    var tEl = el[0];
    if (tEl.nodeName == "#text") tEl.data = "";
    tEl = el[el.length - 1];
    if (tEl.nodeName == "#text") tEl.data = "";
  }
}
