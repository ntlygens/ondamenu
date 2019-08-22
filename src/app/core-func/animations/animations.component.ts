import {
    sequence, trigger, stagger,
    animate, animation, style, group,
    query as q, transition, keyframes,
    animateChild
} from '@angular/animations';
const query = (s, a, o = { optional: true }) => q(s, a, o );

export const fader =
    trigger('routeAnimations', [
        transition('* <=> *', [
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    opacity: 0,
                    transform: 'scale(0) translateY(100%)'
                }),
            ]),
            query(':enter', [
                animate('600ms ease',
                    style({ opacity: 1, transform: 'scale(1) translateY(0)'})
                ),
            ])
        ]),
    ]);

export const slider =
    trigger('routeAnimations', [
        transition('* => isLeft', slideTO('left')),
        transition('* => isRight', slideTO('right')),
        transition('isRight => *', slideTO('left')),
        transition('isLeft => *', slideTO('right')),
    ]);

function slideTO(direction) {
    const optional = { optional: true };
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                [direction]: 0,
                width: '100%'
            })
        ], optional),
        query(':enter', [
            style({ [direction]: '-100%'})
        ]),
        group([
            query(':leave', [
                animate('600ms ease', style({ [direction]: '100%'}))
            ], optional),
            query(':enter', [
                animate('600ms ease', style({ [direction]: '0%'}))
            ], optional),
        ])
    ];
}

/*export const routeAnimations = animation ([
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
]);*/
