import React from "react";
import { DataEditorAll as DataEditor } from "../../data-editor-all.js";
import {
    BeautifulWrapper,
    Description,
    PropName,
    useMockDataGenerator,
    defaultProps,
} from "../../data-editor/stories/utils.js";
import { SimpleThemeWrapper } from "../../stories/story-utils.js";
import type { GridMouseEventArgs } from "../../internal/data-grid/event-args.js";

export default {
    title: "Glide-Data-Grid/DataEditor Demos",

    decorators: [
        (Story: React.ComponentType) => (
            <SimpleThemeWrapper>
                <BeautifulWrapper
                    title="Tooltips"
                    className="double"
                    description={
                        <Description>
                            Using the <PropName>onItemHovered</PropName> event makes it easy to create tooltips. This
                            story is intentionally forced to scroll vertically so layout in scrolling documents can be
                            confirmed.
                        </Description>
                    }>
                    <Story />
                </BeautifulWrapper>
            </SimpleThemeWrapper>
        ),
    ],
};

interface TooltipBounds {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
}

export const Tooltips: React.FC = () => {
    const { cols, getCellContent } = useMockDataGenerator(6);

    const [tooltip, setTooltip] = React.useState<{ val: string; bounds: TooltipBounds } | undefined>();

    const timeoutRef = React.useRef(0);

    const onItemHovered = React.useCallback((args: GridMouseEventArgs) => {
        if (args.kind === "cell") {
            window.clearTimeout(timeoutRef.current);
            setTooltip(undefined);
            timeoutRef.current = window.setTimeout(() => {
                setTooltip({
                    val: `Tooltip for ${args.location[0]}, ${args.location[1]}`,
                    bounds: args.bounds,
                });
            }, 1000);
        } else {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = 0;
            setTooltip(undefined);
        }
    }, []);

    React.useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    return (
        <>
            <DataEditor
                {...defaultProps}
                onItemHovered={onItemHovered}
                getCellContent={getCellContent}
                columns={cols}
                rowMarkers="both"
                rows={1000}
            />
            {tooltip !== undefined && (
                <div
                    style={{
                        position: "fixed",
                        left: tooltip.bounds.left,
                        top: tooltip.bounds.top + tooltip.bounds.height + 4,
                        padding: "8px 12px",
                        color: "white",
                        font: "500 13px Inter",
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        borderRadius: 9,
                        pointerEvents: "none",
                        zIndex: 10_000,
                    }}>
                    {tooltip.val}
                </div>
            )}
        </>
    );
};
