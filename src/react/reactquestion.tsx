import * as React from "react";
import { Question } from "../question";
import { SurveyElement, SurveyError } from "../base";
import { SurveyQuestionCommentItem } from "./reactquestioncomment";
import { SurveyElementBase, ReactSurveyElement } from "./reactquestionelement";
import { SurveyCustomWidget } from "./custom-widget";

export interface ISurveyCreator {
  createQuestionElement(question: Question): JSX.Element;
  renderError(key: string, error: SurveyError, cssClasses: any): JSX.Element;
  questionTitleLocation(): string;
  questionErrorLocation(): string;
}

export class SurveyQuestion extends SurveyElementBase {
  protected question: Question;
  private creator: ISurveyCreator;
  constructor(props: any) {
    super(props);
    this.updateProps(props);
  }
  private updateProps(props: any) {
    this.creator = props.creator;
    this.question = props.question;
  }
  componentWillReceiveProps(nextProps: any) {
    this.unMakeBaseElementReact(this.question);
    this.updateProps(nextProps);
    this.makeBaseElementReact(this.question);
  }
  componentWillMount() {
    this.makeBaseElementReact(this.question);
  }
  componentDidMount() {
    if (!!this.question) {
      this.question["react"] = this;
    }
    this.doAfterRender();
  }
  componentWillUnmount() {
    if (!!this.question) {
      this.question["react"] = null;
    }
    this.unMakeBaseElementReact(this.question);
    var el: any = this.refs["root"];
    if (!!el) {
      el.removeAttribute("data-rendered");
    }
  }
  componentDidUpdate(prevProps: any, prevState: any) {
    this.doAfterRender();
  }
  private doAfterRender() {
    if (this.question) {
      var el: any = this.refs["root"];
      if (
        el &&
        this.question.survey &&
        el.getAttribute("data-rendered") !== "r"
      ) {
        el.setAttribute("data-rendered", "r");
        this.question.survey.afterRenderQuestion(this.question, el);
      }
    }
  }
  render(): JSX.Element {
    if (!this.question || !this.creator) return null;
    if (!this.question.isVisible) return null;
    var cssClasses = this.question.cssClasses;
    var questionRender = this.renderQuestion();
    var title = this.question.hasTitle ? this.renderTitle(cssClasses) : null;
    var description = this.renderDescription(cssClasses);
    var titleLocation = this.question ? this.question.getTitleLocation() : "";
    var titleTop = titleLocation === "top" ? title : null;
    var titleBottom = titleLocation === "bottom" ? title : null;
    var titleLeft = titleLocation === "left" ? title : null;
    var titleLeftClass = titleLocation === "left" ? "title-left" : null;
    var contentLeftClass = titleLocation === "left" ? "content-left" : null;
    var descriptionLeft = titleLocation === "left" ? description : null;
    var descriptionTop = titleLocation === "top" ? description : null;
    var descriptionBottom = titleLocation === "bottom" ? description : null;
    let questionRootClass =
      titleLocation === "left"
        ? cssClasses.mainRoot + " sv_qstn_left"
        : cssClasses.mainRoot;
    if (!!this.question.errors && this.question.errors.length > 0) {
      questionRootClass += " " + cssClasses.hasError;
    }
    var comment =
      this.question && this.question.hasComment
        ? this.renderComment(cssClasses)
        : null;
    var errors = this.renderErrors(cssClasses);
    var errorsTop =
      this.creator.questionErrorLocation() === "top" ? errors : null;
    var errorsBottom =
      this.creator.questionErrorLocation() === "bottom" ? errors : null;
    let rootStyle: { [index: string]: any } = {};
    if (this.question.renderWidth)
      rootStyle["width"] = this.question.renderWidth;
    if (!!this.question.paddingLeft)
      rootStyle["paddingLeft"] = this.question.paddingLeft;
    if (!!this.question.paddingRight)
      rootStyle["paddingRight"] = this.question.paddingRight;

    return (
      <div
        ref="root"
        id={this.question.id}
        className={questionRootClass}
        style={rootStyle}
      >
        <div className={titleLeftClass}>
          {titleTop}
          {descriptionTop}
          {titleLeft}
          {descriptionLeft}
        </div>

        <div className={contentLeftClass}>
          {errorsTop}
          {questionRender}
          {comment}
          {errorsBottom}
          {titleBottom}
          {descriptionBottom}
        </div>
      </div>
    );
  }
  protected renderQuestion(): JSX.Element {
    var customWidget = this.question.customWidget;
    if (!customWidget) {
      return this.creator.createQuestionElement(this.question);
    }
    return (
      <SurveyCustomWidget creator={this.creator} question={this.question} />
    );
  }
  protected renderTitle(cssClasses: any): JSX.Element {
    var titleText = SurveyElementBase.renderLocString(this.question.locTitle);
    return <h5 className={cssClasses.title}>{titleText}</h5>;
  }
  protected renderDescription(cssClasses: any): JSX.Element {
    if (this.question.locDescription.isEmpty) return null;
    var descriptionText = SurveyElementBase.renderLocString(
      this.question.locDescription
    );
    return <div className={cssClasses.description}>{descriptionText}</div>;
  }
  protected renderComment(cssClasses: any): JSX.Element {
    // var commentText = SurveyElementBase.renderLocString(
    //   this.question.locCommentText
    // );
    var commentText = this.question.commentText;
    return (
      <div className="form-group">
        <div>{commentText}</div>
        <SurveyQuestionCommentItem
          question={this.question}
          cssClasses={cssClasses}
          otherCss={cssClasses.other}
        />
      </div>
    );
  }
  protected renderErrors(cssClasses: any): JSX.Element {
    return (
      <SurveyElementErrors
        element={this.question}
        cssClasses={cssClasses}
        creator={this.creator}
      />
    );
  }
}

export class SurveyElementErrors extends ReactSurveyElement {
  protected element: SurveyElement;
  private creator: ISurveyCreator;
  constructor(props: any) {
    super(props);
    this.setElement(props.element);
    this.state = this.getState();
    this.creator = props.creator;
  }
  componentWillReceiveProps(nextProps: any) {
    this.setElement(nextProps.element);
    this.setState(this.getState());
    this.creator = nextProps.creator;
  }
  private setElement(element: any) {
    this.element = element instanceof SurveyElement ? element : null;
  }
  private getState(prevState: any = null) {
    return !prevState ? { error: 0 } : { error: prevState.error + 1 };
  }
  render(): JSX.Element {
    if (!this.element || this.element.errors.length == 0) return null;
    var errors = [];
    for (var i = 0; i < this.element.errors.length; i++) {
      var key = "error" + i;
      errors.push(
        this.creator.renderError(key, this.element.errors[i], this.cssClasses)
      );
    }
    return (
      <div role="alert" className={this.cssClasses.error.root}>
        {errors}
      </div>
    );
  }
}

export class SurveyQuestionAndErrorsCell extends ReactSurveyElement {
  [index: string]: any;
  private questionValue: Question;
  protected creator: ISurveyCreator;
  constructor(props: any) {
    super(props);
    this.setProperties(props);
  }
  componentWillReceiveProps(nextProps: any) {
    if (this.question) {
      this.unMakeBaseElementReact(this.question);
    }
    super.componentWillReceiveProps(nextProps);
    this.setProperties(nextProps);
    if (this.question) {
      this.makeBaseElementReact(this.question);
    }
  }
  protected setProperties(nextProps: any) {
    this.question = nextProps.question;
    this.creator = nextProps.creator;
  }
  protected get question() {
    return this.questionValue;
  }
  protected set question(val: Question) {
    this.questionValue = val;
  }
  private getState(increaseError: boolean = false): any {
    if (!this.question) return;
    var q = this.question;
    var error = !!this.state && !!this.state.error ? this.state.error : 0;
    if (increaseError) error++;
    return { isReadOnly: q.isReadOnly, visible: q.visible, error: error };
  }
  componentWillMount() {
    this.makeBaseElementReact(this.question);
  }
  componentDidMount() {
    this.doAfterRender();
  }
  componentWillUnmount() {
    if (this.question) {
      this.unMakeBaseElementReact(this.question);
      var el: any = this.refs["cell"];
      if (!!el) {
        el.removeAttribute("data-rendered");
      }
    }
  }
  componentDidUpdate(prevProps: any, prevState: any) {
    this.doAfterRender();
  }
  protected doAfterRender() {}
  protected getCellClass(): any {
    return null;
  }
  render(): JSX.Element {
    if (!this.question) return null;
    var errors = (
      <SurveyElementErrors
        element={this.question}
        cssClasses={this.cssClasses}
        creator={this.creator}
      />
    );
    var renderedCell = this.renderCell();
    return (
      <td
        ref="cell"
        className={this.getCellClass()}
        headers={
          this.question.isVisible && !!this["cell"]
            ? this["cell"].column.locTitle.renderedHtml
            : ""
        }
      >
        {errors}
        {renderedCell}
      </td>
    );
  }
  renderCell(): JSX.Element {
    if (!this.question.visible) return null;
    var customWidget = this.question.customWidget;
    if (!customWidget) {
      return this.creator.createQuestionElement(this.question);
    }
    return (
      <SurveyCustomWidget creator={this.creator} question={this.question} />
    );
  }
}
