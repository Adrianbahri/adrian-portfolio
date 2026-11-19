'use client';

import React, { forwardRef } from 'react';

const MOTION_ONLY_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'viewport',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'onAnimationComplete',
  'onUpdate',
]);

function stripMotionProps(props: Record<string, any>) {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (!MOTION_ONLY_PROPS.has(key)) {
      clean[key] = val;
    }
  }
  return clean;
}

function createTag(tag: keyof React.JSX.IntrinsicElements) {
  const Comp = forwardRef<any, any>((props, ref) => {
    const cleanProps = stripMotionProps(props);
    return React.createElement(tag, { ...cleanProps, ref });
  });
  Comp.displayName = `motion.${String(tag)}`;
  return Comp;
}

const cache = new Map<string, any>();

type MotionComponentMap = {
  [K in keyof React.JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
    React.JSX.IntrinsicElements[K] & Record<string, any>
  >;
};

export const motion = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (!cache.has(prop)) {
        cache.set(prop, createTag(prop as keyof React.JSX.IntrinsicElements));
      }
      return cache.get(prop);
    },
  }
) as MotionComponentMap;

export function AnimatePresence({
  children,
}: {
  children?: React.ReactNode;
  mode?: string;
  initial?: boolean;
}) {
  return <>{children}</>;
}
