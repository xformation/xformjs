import * as React from "react";
import { Survey } from "./reactSurvey";
import { SurveyError } from "../base";
import { SurveyElementBase, SurveyLocString } from "./reactquestionelement";

export class SurveyCollapseForm extends Survey {
    constructor(props: any) {
        super(props);
        this.toggleForm = this.toggleForm.bind(this);
    }
    toggleForm(): void {
        this.setState({
            isCollapsed: !this.state.isCollapsed
        });
    }
    doRender(): JSX.Element {
        var renderResult;
        if (this.survey.state == "completed") {
            renderResult = this.renderCompleted();
        } else if (this.survey.state == "completedbefore") {
            renderResult = this.renderCompletedBefore();
        } else if (this.survey.state == "loading") {
            renderResult = this.renderLoading();
        } else if (this.survey.state == "starting") {
            renderResult = this.renderStartPage();
        } else {
            renderResult = this.renderSurvey();
        }
        var title = this.renderTitle();

        return (
            <div ref="root" className={this.css.root}>
                <form>
                    <div className="sv_container">
                        {title}
                        {!this.state.isCollapsed && renderResult}
                    </div>
                </form>
            </div>
        );
    }
    renderTitle(): JSX.Element {
        let title = null;
        const isCollapsed = this.state.isCollapsed;
        if (this.survey.title && this.survey.showTitle) {
            title = SurveyElementBase.renderLocString(this.survey.locTitle);
        }
        return title ? (
            <div className={`${this.css.header} ${this.state.isError === 1 ? this.css.headerError : (this.state.isError === 0 ? this.css.headerNoError: "")}`} onClick={this.toggleForm}>
                <h3>
                    {title}
                    <span className={this.css.collapseHeader || "pull-right"}>
                        {
                            !isCollapsed && <i className={this.css.minusIcon || "fa fa-fw fa-minus"}></i>
                        }
                        {
                            isCollapsed && <i className={this.css.plusIcon || "fa fa-fw fa-plus"}></i>
                        }
                    </span>
                </h3>
            </div>
        ) : null;
    }

    protected setSurveyEvents(newProps: any) {
        super.setSurveyEvents(newProps);
        this.survey.onValueChanged.add((sender, options: any) => {
            if (options.question.errors.length > 0 && !this.state.isError) {
                this.setState({
                    isError: 1
                });
            } else if (options.question.errors.length === 0 && this.state.isError) {
                this.setState({
                    isError: 0
                });
            }
        });
    }
}
