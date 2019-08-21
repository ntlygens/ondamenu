import {
    sequence, trigger, stagger,
    animate, animation, style, group,
    query as q, transition, keyframes,
    animateChild
} from '@angular/animations';
const query = (s, a, o = { optional: true }) => q(s, a, o );

export const routeTransition = animation ([
    query( ':enter, :leave',
        style({position: 'fixed', width: '100%'})),

    sequence([
        query(':leave', animateChild()),
        group([
            query(':leave', [
                style({ transform: '{{transformStatic}}' }),
                animate('{{timingOut}}',
                    style({ transform: '{{transformOut}}' }))
            ]),
            query(':enter', [
                style({ transform: '{{transformIn}}' }),
                animate('{{timingIn}}',
                    style({ transform: '{{transformStatic}}' })),
            ]),
        ]),
        query(':enter', animateChild()),
    ])
]);
