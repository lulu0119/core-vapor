import { BindingTypes, NodeTypes } from '@vue/compiler-dom'
import { IRNodeTypes } from '../../src'
import { getBaseTransformPreset } from '../../src/compile'
import { makeCompile } from './_utils'

const [nodeTransforms, directiveTransforms] = getBaseTransformPreset(true)
const compileWithOnce = makeCompile({
  nodeTransforms,
  directiveTransforms,
})

describe('compiler: v-once', () => {
  test('basic', () => {
    const { ir, code, helpers } = compileWithOnce(
      `<div v-once>
        {{ msg }}
        <span :class="clz" />
      </div>`,
      {
        bindingMetadata: {
          msg: BindingTypes.SETUP_REF,
          clz: BindingTypes.SETUP_REF,
        },
      },
    )

    expect(code).toMatchSnapshot()
    expect(helpers).lengthOf(0)
    expect(ir.block.effect).lengthOf(0)
    expect(ir.block.operation).toMatchObject([
      {
        type: IRNodeTypes.CREATE_TEXT_NODE,
        id: 0,
        values: [
          {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'msg',
            isStatic: false,
          },
          {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: ' ',
            isStatic: true,
          },
        ],
        effect: false,
      },
      {
        element: 1,
        type: IRNodeTypes.SET_PROP,
        prop: {
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'class',
            isStatic: true,
          },
          values: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'clz',
              isStatic: false,
            },
          ],
        },
      },
      {
        type: IRNodeTypes.PREPEND_NODE,
        elements: [0],
        parent: 2,
      },
    ])
  })

  test('as root node', () => {
    const { ir, code, helpers } = compileWithOnce(`<div :id="foo" v-once />`)

    expect(code).toMatchSnapshot()
    expect(helpers).lengthOf(0)
    expect(ir.block.effect).lengthOf(0)
    expect(ir.block.operation).toMatchObject([
      {
        type: IRNodeTypes.SET_PROP,
        element: 0,
        prop: {
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'id',
            isStatic: true,
          },
          values: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'foo',
              isStatic: false,
            },
          ],
        },
      },
    ])
    expect(code).not.contains('renderEffect')
  })

  test('on nested plain element', () => {
    const { ir, code, helpers } = compileWithOnce(
      `<div><div :id="foo" v-once /></div>`,
    )

    expect(code).toMatchSnapshot()
    expect(helpers).lengthOf(0)
    expect(ir.block.effect).lengthOf(0)
    expect(ir.block.operation).toMatchObject([
      {
        type: IRNodeTypes.SET_PROP,
        element: 0,
        prop: {
          runtimeCamelize: false,
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'id',
            isStatic: true,
          },
          values: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'foo',
              isStatic: false,
            },
          ],
        },
      },
    ])
  })

  test.todo('on component')
  test.todo('on slot outlet')

  test('inside v-once', () => {
    const { ir, code, helpers } = compileWithOnce(
      `<div v-once><div v-once/></div>`,
    )

    expect(code).toMatchSnapshot()
    expect(helpers).lengthOf(0)
    expect(ir.block.effect).lengthOf(0)
    expect(ir.block.operation).lengthOf(0)
  })

  test.todo('with hoistStatic: true')
  test('with v-if/else', () => {
    const { ir, code, helpers } = compileWithOnce(
      `<div v-if="BOOLEAN" v-once /><p v-else/>`,
    )
    expect(code).toMatchSnapshot()
    expect(helpers).lengthOf(0)
    expect(ir.block.effect).lengthOf(0)
    console.log(JSON.stringify(ir.block.operation, null, 2))
    expect(ir.block.operation).toMatchObject([
      {
        type: IRNodeTypes.IF,
        id: 0,
        effect: false,
        condition: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'BOOLEAN',
          isStatic: false,
        },
        positive: {
          type: IRNodeTypes.BLOCK,
          dynamic: {
            children: [{ template: 0 }],
          },
          node: {
            props: [
              {
                type: NodeTypes.DIRECTIVE,
                exp: {
                  type: NodeTypes.SIMPLE_EXPRESSION,
                  content: 'BOOLEAN',
                  isStatic: false,
                },
              },
            ],
          },
        },
        negative: {
          type: IRNodeTypes.BLOCK,
          dynamic: {
            children: [{ template: 1 }],
          },
        },
      },
    ])
    expect(ir.block.returns).toEqual([0])
  })
  test.todo('with v-for')
})
