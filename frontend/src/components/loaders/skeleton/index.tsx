import "./skeleton.css"

export const SKELETON_TRANSITION_TIME = 200 // ms

export function LoaderSkeleton(props: { show?: boolean, className?: string, style?: React.CSSProperties }) {
    const { show, className, style } = props

    return <div className={`loader-skeleton ${className ?? ""}`} style={{
        ...style,
        "--transition-time": `${SKELETON_TRANSITION_TIME / 1000}s`
    } as React.CSSProperties } data-show={show ?? true} />
}