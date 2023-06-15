import { createJsonClient } from "restify-clients";

export interface IContext {
    FirstName: string;
    LastName: string;
    ProjectName: string;
}

export interface IDashboard {
    CaseId: string;
    Title: string;
    Number: string;
    Revision: string;
}

export interface ICaseApprovalOutcome {
    Id: string;
    Label: string;
}
export interface ICaseApproval {
    Id: string;
    Title: string;
    CanAssign: boolean;
    CanApprove: boolean;
    CanSkip: boolean;
    Outcomes: ICaseApprovalOutcome[];
}
export interface ICaseApprovals {
    CaseId: string;
    Approvals: ICaseApproval[];
}
export class GlaassApi {
    constructor(private apiKey: string) {}

    private Get<T>(path: string) {
        const client = createJsonClient({
            url: 'https://beta-api.glaass.net/'
        })
        const options = {
            path: '/api/' + path,
            headers: {
                'X-Glaass-Token': this.apiKey
            }
        }
        return new Promise<T>((resolve, reject) => {
            client.get(options, (err, req, resp, obj) => {
                if (err) reject(err);
                resolve(obj);
            });
        });
    }
    private Post<T>(path: string, data: any) {
        const client = createJsonClient({
            url: 'https://beta-api.glaass.net/'
        })
        const options = {
            path: '/api/' + path,
            headers: {
                'X-Glaass-Token': this.apiKey
            }
        }
        return new Promise<T>((resolve, reject) => {
            client.post(options, data, (err, req, resp, obj) => {
                if (err) reject(err);
                resolve(obj);
            });
        });
    }
    public async GetContext() {
        return await this.Get<IContext>('me');
    }
    public async GetApprovals(top: number) {
        return await this.Get<IDashboard[]>('d/approvals?top=' + top);
    }
    public async GetApproval(caseId: string) {
        return await this.Get<ICaseApprovals>('c/' + caseId + '/approval');
    }
    public async PostApproval(caseId: string, stepId: string, outcome: string) {
        return await this.Post<void>('c/' + caseId + '/approval', { StepId: stepId, OutcomeId: outcome });
    }
}