import { Directive, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

@Directive()
export class ComponentBase implements OnDestroy {
    private subscriptions: Array<Subscription> = [];
    protected registerSubscription(sub: Subscription) {
        this.subscriptions.push(sub);
    }
    ngOnDestroy() {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        })
    }
}