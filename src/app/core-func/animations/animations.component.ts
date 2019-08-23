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
                    transform: 'translateX(100%)'
                }),
            ]),
            query(':enter', [
                animate('600ms ease',
                    style({ opacity: 1, transform: 'translateX(0)'})
                ),
            ])
        ]),
    ]);

export const slider = [
    trigger('routeAnimations',  [
        transition('* => isLeft', slideTO('left')),
        transition('* => isRight', slideTO('right')),
        transition('isRight => *', slideTO('left')),
        transition('isLeft => *', slideTO('right')),
    ]),
    trigger('userRouteAnimations',  [
        transition('* => isLeft', slideTO('left')),
        transition('* => isRight', slideTO('right')),
        transition('isRight => *', slideTO('left')),
        transition('isLeft => *', slideTO('right')),
    ])
];

/*
export const userSlider =
    trigger('userRouteAnimations',  [
        transition('* => isLeft', slideTO('left')),
        transition('* => isRight', slideTO('right')),
        transition('isRight => *', slideTO('left')),
        transition('isLeft => *', slideTO('right')),
    ]);
*/


function slideTO(direction) {
    const optional = { optional: true };
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                [direction]: 0,
                width: '100%',
                'z-index': 2,
                opacity: 1,
            })
        ], optional),
        query(':enter', [
            style({ [direction]: '-100%', opacity: 0, 'z-index': 2 })
        ]),
        query(':leave', [
            style({ [direction]: '100%', opacity: 0, 'z-index': 1 })
        ]),
        group([
            query(':leave', [
                animate('600ms ease', style({ [direction]: '100%', opacity: 0, 'z-index': 1}))
            ], optional),
            query(':enter', [
                animate('600ms ease', style({ [direction]: '0%', opacity: 1, 'z-index': 2}))
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
