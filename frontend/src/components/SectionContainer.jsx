/**
 * Semantic section wrapper: outer <section> + .container + framed .content-panel.
 * Use for every major homepage block and static pages for consistent hierarchy.
 * @param {string} [containerClassName] — optional classes on the inner `.container` (e.g. `container--narrow`).
 */
export default function SectionContainer({
  id,
  className = '',
  panelClassName = '',
  containerClassName = '',
  children,
  // eslint-disable-next-line no-unused-vars -- `Outer` is the JSX root element below; ESLint does not treat it as a reference here
  as: Outer = 'section',
  tight = false,
  ...rest
}) {
  const outerClass = ['section', tight ? 'section--tight' : '', className].filter(Boolean).join(' ')
  const panelClass = ['content-panel', 'section-panel', panelClassName].filter(Boolean).join(' ')
  const innerContainerClass = ['container', containerClassName].filter(Boolean).join(' ')

  return (
    <Outer id={id} className={outerClass} {...rest}>
      <div className={innerContainerClass}>
        <div className={panelClass}>{children}</div>
      </div>
    </Outer>
  )
}
