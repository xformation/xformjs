import * as React from "react";
import { Survey } from "./reactSurvey";
import { SurveyElementBase } from "./reactquestionelement";

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
            <div className={this.css.header} onClick={this.toggleForm}>
                <h3>
                    {title}
                    <span className="float-right">
                        {
                            !isCollapsed && <i className="fas fa-minus-square"></i>
                        }
                        {
                            isCollapsed && <i className="fas fa-plus-square"></i>
                        }
                    </span>
                </h3>
            </div>
        ) : null;
    }
}
