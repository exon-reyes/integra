import { Component } from '@angular/core';
import { FeaturesWidget } from '@/pages/dashboard/components/featureswidget';

@Component({
    selector: 'app-dashboard',
    imports: [FeaturesWidget],
    template: `
       <features-widget></features-widget>

        <!--            <app-stats-widget class="contents" />-->
        <!--            <div class="col-span-12 xl:col-span-6">-->
        <!--                <app-recent-sales-widget />-->
        <!--                <app-best-selling-widget />-->
        <!--            </div>-->
        <!--            <div class="col-span-12 xl:col-span-6">-->
        <!--                <app-revenue-stream-widget />-->
        <!--                <app-notifications-widget />-->
        <!--            </div>-->
    `
})
export class Dashboard {}
