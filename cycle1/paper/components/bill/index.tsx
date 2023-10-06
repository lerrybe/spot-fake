'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { useSpring, animated } from '@react-spring/web';
import S from './styles.module.css';

import {
  getOffset,
  getRotate,
  getOpacity,
  getHoloMask,
} from '@/utils/calculate';
import { Mode } from '@/types/bill';
import { centerHolo } from '@/constants/imgUrls';

import backImage from '@/public/images/pictures/back.png';
import frontImage from '@/public/images/pictures/front.png';
import tiltedBackImage from '@/public/images/pictures/tilt_back.png';
import hiddenImage from '@/public/images/pictures/genuine_hidden_pic.png';
import registerImage from '@/public/images/pictures/genuine_circle_logo.png';
import blueLightedFrontImage from '@/public/images/pictures/front_blue_light.png';
import blueLightedHoloImage from '@/public/images/pictures/genuine_blue_light_pic.svg';

export default function Bill({
  clipPath = 'none',
  mode = Mode.LIGHTED,
}: {
  mode?: Mode;
  clipPath?: string;
}) {
  const [holoMask, holoMaskApi] = useSpring(() => ({
    from: {
      '--color-holo-mask': `url(${centerHolo})`,
    },
  }));
  const [rotate, rotateApi] = useSpring(() => ({
    from: {
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
    },
  }));
  const [pointer, pointerApi] = useSpring(() => ({
    from: {
      '--pointer-x': '0px',
      '--pointer-y': '0px',
    },
  }));
  const [opacity, opacityApi] = useSpring(() => ({
    from: {
      '--back-img-opacity': '15%',
      '--hidden-img-opacity': '0%',
      '--register-img-opacity': '50%',
    },
  }));

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const offset = getOffset(e);
      const rotate = getRotate(offset.x, offset.y);

      holoMaskApi.start({
        to: {
          '--color-holo-mask': getHoloMask(offset.x),
        },
      });
      pointerApi.start({
        to: {
          '--pointer-x': `${offset.x}px`,
          '--pointer-y': `${offset.y}px`,
        },
      });

      if (mode === Mode.LIGHTED || mode === Mode.BACK_LIGHTED) {
        rotateApi.start({
          to: {
            '--rotate-x': `${rotate.x}deg`,
            '--rotate-y': `${rotate.y}deg`,
          },
        });
      }
      if (mode === Mode.BACK_LIGHTED) {
        const opacities = getOpacity(offset.x, offset.y);
        opacityApi.start({
          to: {
            '--back-img-opacity': opacities.backImg,
            '--hidden-img-opacity': opacities.hiddenImg,
            '--register-img-opacity': opacities.registerImg,
          },
        });
      }
    },
    [mode, opacityApi, pointerApi, rotateApi, holoMaskApi],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      const config = { mass: 3.5, tension: 350, friction: 40 };

      rotateApi.start({
        to: {
          '--rotate-x': '0deg',
          '--rotate-y': '0deg',
        },
        config,
      });
      holoMaskApi.start({
        to: {
          '--color-holo-mask': `url(${centerHolo})`,
        },
        config,
      });
      pointerApi.start({
        to: {
          '--pointer-x': '0px',
          '--pointer-y': '0px',
        },
        config,
      });
      opacityApi.start({
        to: {
          '--back-img-opacity': '15%',
          '--hidden-img-opacity': '0%',
          '--register-img-opacity': '50%',
        },
        config,
      });
    },
    [opacityApi, pointerApi, rotateApi, holoMaskApi],
  );

  return (
    <animated.div
      style={{
        clipPath,
        ...rotate,
        ...pointer,
        ...opacity,
        ...holoMask,
      }}
      className={S.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* [COMMON] LAYER 1 */}
      <div className={S.translate}>
        <div className={S.rotate}>
          <Image
            priority
            className={S.front_img_main}
            alt={'main front image of bill'}
            src={
              mode === Mode.BLUE_LIGHTED ? blueLightedFrontImage : frontImage
            }
          />

          {/* [COND (WHITE, BACK)] LAYERS */}
          {mode !== Mode.BLUE_LIGHTED && (
            <>
              {/* LAYER 2 */}
              <div className={S.front_mask_holo_mono}></div>
              {/* LAYER 3 */}
              <div className={S.front_mask_holo_color}>
                <div className={S.front_mask_holo_color_bg}></div>
              </div>
              {/* LAYER 4 */}
              <div className={S.front_glitter}></div>
            </>
          )}

          {/* [COND (BACK)] LAYERS */}
          {mode === Mode.BACK_LIGHTED && (
            <>
              {/* LAYER 5 */}
              <Image
                src={hiddenImage}
                className={S.back_img_hidden}
                alt={'hidden image of bill'}
              />
              {/* LAYER 6 */}
              <Image
                src={backImage}
                className={S.back_img}
                alt={'transparent back image of bill'}
              />
              {/* LAYER 7 */}
              <Image
                src={registerImage}
                className={S.back_circle_register}
                alt={'see through circle register of bill'}
              />
            </>
          )}

          {/* [COND (BLUE)] LAYERS */}
          {mode === Mode.BLUE_LIGHTED && (
            <>
              {/* LAYER 8 */}
              <div className={S.front_blue_lighted_filter}></div>
              {/* LAYER 9 */}
              <Image
                src={blueLightedHoloImage}
                className={S.front_blue_lighted_holo}
                alt={'holo image of bill'}
              />
            </>
          )}

          {/* [COND (LIGHTED)] LAYER 10 */}
          {mode === Mode.LIGHTED && <div className={S.glare}></div>}

          {/* [COMMON] LAYER 11 */}
          {/*<Image*/}
          {/*  src={tiltedBackImage}*/}
          {/*  className={S.back_img_tilted}*/}
          {/*  alt={'tilted main back image of bill'}*/}
          {/*/>*/}
        </div>
      </div>
    </animated.div>
  );
}
