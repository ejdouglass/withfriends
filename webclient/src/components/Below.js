import React, { useContext } from 'react';
import { Context } from '../context/context';
import { GroundBox } from './styled';
import basicGrass from '../assets/groundboxes/basicGrass.jpg';

const Below = () => {
    const [state] = useContext(Context);

    return (
        <GroundBox color={state.below.color} bg={basicGrass}>
        </GroundBox>
    )
}

export default Below;

/*

Multiple GROUNDBOX elements could be possible, give us some parallax behavior, as well as multiple ground-types or some more visual interest.
-- Idea One: Fuller-width 'close up', 'slightly further away', 'slightly even further away' strips
-- Idea Two: Maybe part of 'AroundMe' - local flowers, decorations, objects on the ground and otherwise hanging out

It'd be interesting if I could pass in gradients, which is pretty straightforward (just strings).
-- more difficult would be passing in dynamic gradients, though it's doable with some forethought and pattern recog

More interesting, would it be possible to pass in animations? In 'styled' they are also strings, so maybe we could.
-- popping back to styled to 'hardcode' it for now
-- can either define them here and pass them in (preferred), or define them in styled.js and then pass from the list here (also doable)


Anyhoo, right now ABOVE is our model, and it just copies directly from state.
-- That's one method: have 'state' know from it's TRUTH ORIGIN (backend, eventually) precisely what values we should have, and then just display them,
-- Another style: have the TRUTH DATA be 'raw' rather than computed, and have the user's front-end do the work, here
    -> Meaning we'd get raw "time of day, environment, lightness" etc. data and this component would interpret that into what images, gradients, etc. to use


Randomly, I just thought of a cool idea: MOON REFLECTION, or having a secondary radial-gradient that represents the influence of the moon(s), sun, etc.
    -- This would allow cool 'reflections' in water areas, and as the sun-source moves across the sky if outdoors

... for 'trees,' for whatever component I make for "Surroundings" or "Around," I could have separately placed 'tree elements' that could be backlit
    -- by gradients, of course :P ... wowee
    -- consider this also for background/distance drawn stuff like towns, mountains, etc. ('advanced' but it'd be fun to do)

Related, having a "sun color" based on time of day, overcast-ness, overcast-type (ashes vs clouds :P) would be a really fun eventual goal

*/