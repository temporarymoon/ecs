import { EidGenerator } from './EidGenerator'
import { ComponentManager } from '../types/ComponentManager'
import { MappedComponentManager } from './MappedComponentManager'

type ComponentManagerMap<T extends object> = {
  [K in keyof T]: ComponentManager<T[K]>
}

type ComponentList<T> = (keyof T)[]

export class Ecs<T extends object> {
  private componentLists = new MappedComponentManager<ComponentList<T>>()

  public constructor(
    public components: ComponentManagerMap<T>,
    private generator = new EidGenerator()
  ) {}

  public create(components: Partial<T>) {
    const eid = this.generator.create()

    for (const name in components) {
      const typedName = name as keyof typeof components

      this.components[typedName].register(eid, components[typedName]!)
    }

    this.componentLists.register(
      eid,
      Object.keys(components) as ComponentList<T>
    )

    return eid
  }

  public getComponentsByEid<K extends keyof T>(eid: number) {
    const baseObject = {} as Pick<T, K>

    for (const key of this.componentLists.getComponentByEid(eid)) {
      const typedKey = key as K

      baseObject[typedKey] = this.components[typedKey].getComponentByEid(eid)
    }

    return baseObject
  }

  public pickComponentByEid<K extends keyof T>(eid: number, components: K[]) {
    const baseObject = {} as Pick<T, K>

    for (const key of components) {
      const typedKey = key as K

      baseObject[typedKey] = this.components[typedKey].getComponentByEid(eid)
    }

    return baseObject
  }
}
