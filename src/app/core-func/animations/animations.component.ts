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
    ])
];

export const slider = [
    trigger('routeAnimations',  [
        transition('* => isLeft', slideTO('left')),
        transition('* => isRight', slideTO('right')),
        transition('isRight => *', slideTO('left')),
        transition('isLeft => *', slideTO('right')),
    ])
];

export function slideTO(direction: string): any[] {
    // const optional = { optional: true };
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                [`direction`]: 0,
                width: '100%',
                'z-index': 2,
                opacity: 1,
            })
        ], {optional: true}),
        query(':enter', [
            style({ direction: '-100%', opacity: 0, 'z-index': 2 })
        ], {optional: true}),
        query(':leave', [
            style({ direction: '100%', opacity: 0, 'z-index': 1 })
        ], {optional: true}),
        group([
            query(':leave', [
                animate('600ms ease', style({ direction: '100%', opacity: 0, 'z-index': 1}))
            ], {optional: true}),
            query(':enter', [
                animate('600ms ease', style({ direction: '0%', opacity: 1, 'z-index': 2}))
            ], {optional: true}),
        ])
    ];
}
