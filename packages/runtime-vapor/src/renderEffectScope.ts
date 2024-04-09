import { EffectScope, getCurrentScope } from '@vue/reactivity'
import type { ComponentInternalInstance } from './component'
import type { DirectiveBindingsMap } from './directives'

export class RenderEffectScope extends EffectScope {
  /**
   * instance
   * @internal
   */
  ie: ComponentInternalInstance
  /**
   * isMounted
   * @internal
   */
  im: boolean
  /**
   * directives
   * @internal
   */
  dirs: DirectiveBindingsMap | undefined

  constructor(
    instance: ComponentInternalInstance,
    parentScope: EffectScope | null,
  ) {
    const isInOtherScope = parentScope && parentScope !== getCurrentScope()
    isInOtherScope && parentScope.on()
    try {
      super(!parentScope)
    } finally {
      isInOtherScope && parentScope.off()
    }
    this.im = false
    this.ie = instance
  }
}

export function isRenderEffectScope(
  scope: EffectScope | undefined,
): scope is RenderEffectScope {
  return scope instanceof RenderEffectScope
}
