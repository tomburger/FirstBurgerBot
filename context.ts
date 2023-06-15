import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import rawContextCard from "./adaptiveCards/context.json";
import { CardFactory, TurnContext } from "botbuilder";
import { GlaassApi, IContext } from "./glaass";

export async function SendContextCard(apiKey: string, context: TurnContext) {
    const api = new GlaassApi(apiKey);
    const data = await api.GetContext();
    const card = AdaptiveCards.declare<IContext>(rawContextCard).render(data);
    await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
}