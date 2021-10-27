import {
    sequence, trigger, stagger,
    animate, animation, style, group,
    query as q, transition, keyframes,
    animateChild, state
} from '@angular/animations';
export function query(s, a, o) {
    return q(s, a, o );
}
// const query = (s, a, o = { optional: true }) => q(s, a, o );

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
            ], {optional: true}),
            query(':enter', [
                animate('600ms ease',
                    style({ opacity: 1, transform: 'translateX(0)'})
                ),
            ], {optional: true})
        ]),
    ]);

export const lift = [
    trigger('footerAnimations', [
        state('show', style({
            opacity: 1,
            /*transform: 'translateY(0)',*/
            bottom: 0,
        })),
        state('hide', style({
            opacity: 1,
            /*transform: 'translateY(-30px)',*/
            bottom: '-45px'
        })),
        transition('show => hide', animate('500ms ease-out')),
        transition('hide => show', animate('500ms ease-in'))
    ]),
    trigger('cartAnimations', [
        state('open', style({
            opacity: 1,
            /*transform: 'translateY(0)',*/
            top: '130px',
            zIndex: 3

        })),
        state('close', style({
            opacity: 0.9,
            /*transform: 'translateY(-30px)',*/
            top: '720px',
            zIndex: 2
        })),
        transition('open => close', animate('500ms ease-out')),
        transition('close => open', animate('300ms ease-out'))
    ]),
    trigger('mnmzeAnimations', [
        state('normal', style({
            transform: 'translateY(0)',
        })),
        state('minimized', style({
            transform: 'translateY(-150px)',
        })),
        transition('normal => minimized', animate('500ms ease-out')),
        transition('minimized => normal', animate('300ms ease-out'))
    ]),
    trigger('mnmzeDohAnimations', [
        state('normal',
            style({
                transform: 'translate(0, 0)'
            })),
        state('minimized', style({
            transform: ('translate(-100px, 22px)'),
            // top: '720px',
        })),
        transition('normal => minimized', animate('300ms ease')),
        transition('minimized => normal', animate('200ms ease'))
    ]),
    trigger('mnmzeImgAnimations', [
        state('normal',
            style({
                transform: 'translate(0, 0)'
            })),
        state('minimized', style({
            transform: ('translate(0, -150px)'),
            // top: '720px',
        })),
        transition('normal => minimized', animate('300ms ease')),
        transition('minimized => normal', animate('200ms ease'))
    ]),
    trigger('mnmzeCntnrAnimations', [
        state('normal',
            style({
                transform: 'translate(0, 0)'
            })),
        state('minimized',
            style({
            transform: ('translate(0, -151px)'),
            // top: '720px',
        })),
        transition('normal => minimized', animate('400ms ease-in')),
        transition('minimized => normal', animate('200ms ease'))
    ])
];

export const slider = [
    trigger('routeAnimations',  [
        transition('* => isLeft', slideToLeft()),
        transition('* => isRight', slideToRight()),
        transition('isRight => *', slideToLeft()),
        transition('isLeft => *', slideToRight()),
    ])
];


export function slideToRight(): any[] {
    // const optional = { optional: true };
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                'z-index': 2,
                opacity: 1,
            }),
        ], {optional: true}),
        query(':enter', [
            style({ right: '-100%', opacity: 0, 'z-index': 2 })
        ], {optional: true}),
        query(':leave', [
            style({ right: '100%', opacity: 0, 'z-index': 1 })
        ], {optional: true}),
        group([
            query(':leave', [
                animate('600ms ease', style({ right: '100%', opacity: 0, 'z-index': 1}))
            ], {optional: true}),
            query(':enter', [
                animate('600ms ease', style({ right: '0%', opacity: 1, 'z-index': 2}))
            ], {optional: true}),
        ])
    ];
}

export function slideToLeft(): any[] {
    // const optional = { optional: true };
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                'z-index': 2,
                opacity: 1,
            }),
        ], {optional: true}),
        query(':enter', [
            style({ left: '-100%', opacity: 0, 'z-index': 2 })
        ], {optional: true}),
        query(':leave', [
            style({ left: '100%', opacity: 0, 'z-index': 1 })
        ], {optional: true}),
        group([
            query(':leave', [
                animate('600ms ease', style({ left: '100%', opacity: 0, 'z-index': 1}))
            ], {optional: true}),
            query(':enter', [
                animate('600ms ease', style({ left: '0%', opacity: 1, 'z-index': 2}))
            ], {optional: true}),
        ])
    ];
}
