import { IAdaptiveCard } from "adaptivecards";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import rawApprovalsCard from "./adaptiveCards/approvals.json";
import rawApprovedCard from "./adaptiveCards/approved.json";
import { ActionTypes, ActivityTypes, CardFactory, TurnContext } from "botbuilder";
import { GlaassApi } from "./glaass";

interface IApprovalOutcomeData {
    Id: string;
    Label: string;
}
interface IApprovalData {
    CaseId: string;
    Number: string;
    CaseTitle: string;
    StepId: string;
    StepTitle: string;
    Outcomes: IApprovalOutcomeData[];
}

export async function SendApprovalsCard(apiKey: string, context: TurnContext) {
    await context.sendActivity({ type: ActivityTypes.Typing });
    const api = new GlaassApi(apiKey);
    const approvals = await api.GetApprovals(3);
    await context.sendActivity("There are these approvals on top of your inbox:");
    const cards: IAdaptiveCard[] = [];
    for (let ix = 0; ix < approvals.length; ix++) {
        const steps = await api.GetApproval(approvals[ix].CaseId);
        if (steps.Approvals) {
            for (let jx = 0; jx < steps.Approvals.length; jx++) {
                const data = {
                    CaseId: approvals[ix].CaseId,
                    Number: approvals[ix].Number,
                    CaseTitle: approvals[ix].Title,
                    StepId: steps.Approvals[jx].Id,
                    StepTitle: steps.Approvals[jx].Title,
                    Outcomes: steps.Approvals[jx].Outcomes.map(o => ({ Id: o.Id, Label: o.Label })),
                }
                cards.push(AdaptiveCards.declare<IApprovalData>(rawApprovalsCard).render(data));
            }
        }
    }
    await context.sendActivity({ attachments: cards.map(CardFactory.adaptiveCard) });
}

export async function ProcessApprovalFromCard(apiKey: string,caseId: string, stepId: string, outcome: string, context: TurnContext) {
    const api = new GlaassApi(apiKey);
    api.PostApproval(caseId, stepId, outcome);
    const card = AdaptiveCards.declare(rawApprovedCard).render({});
    await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
    });
}