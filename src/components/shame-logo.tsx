import Image from 'next/image';

export function ShameLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARlSURBVHhe7ZxLyxtREMf/i6gYxElIyEEiDxA8eHGgKMiLgiAPehA8ePAgeA8ePCh48CDkIIpX0IN4QchXhBwh6kFBiR4Ekd/PajfN9u/u3t2e3Wl2sz7pB+dOd1V1dVdXdXW11JRTp07V8+fP66+//loLFy7UDx8+tA4dOlR79+7dWrZsmSsoKLDi4uKa5557riUlJWlBQUFaTk6OFRUV1Rw6dGjasmVLe/Xqlc7OzhbY2tq2ysrKGjg4OFgFBQX1q1evag8ePGgdOnRo/fTpU338+FFnZ2eLYGFhQQcHB8v8/PwaAIsXL6516dKl4jh69Ch9/PhR+vbtW1p//fXXYjzy8/O1WbNmla1bt9bs27evJiYm1PDw8Co/P7/y6dOnOnnyZEVFRUXhHjhwoHbu3Fn79u1b+vDhQ3327Fl9+fJlXVRUREVERHgCgYGB2rx5c+3Vq1fd3d2t+fn5mpeXV7t69Sq1trZqOztbbWxsjN+1a1ePHz++yM7OVp8+faoHDx5oERER0rVr1+rw8LCGhoaK/z169Kjy8/M1Pz+/dujQoXr69GkNGDBAzp8/b0lJSQp/nz592gcPHjQ1NTXpwoUL+vHjR2VnZ2e9e/eu/vjxQwUGBsrmzZvL6dOnLdi9e/fKyMgI9/T07Jk3b17y6dOnmj9/vhQUFLR8+fLFiIgIHhAQIN26dat+9uxZTUtLo0VFRRXHxsZq27ZtOzg4WAcGBjR//vxy8eLFys/Pt3z06FGtW7euzpo1S1u3bi2zZ88u8/LyfPXs2TMsFovV1tYWt2/fPszOzvbOnz9vCQkJLUNDg+L4+HgPHz68wMvLK+LxeHfs2LHc/Pw829/f33Pw4ME6ODhY+vr1a/ny5csKDw9XAQEB3tPTs1u3bl3Kycmx/Pr1axkYGNCbN2+0Tz/9VAoLCx0QECBbtmwpmzdvLr///rsMHz5cW7ZsKaNHj24hISEKzMjIUJKTk328vJxD5eXlzXv37hXPnj2bMjMzXb16tWzdupUGBQXJBQsWeDk5OY4uLi79nTt3dOrUqWpwcLDy8/NVb29vFRQUhGvWrCmDBg1quXHjht6/f1/z589f8d9//92VK1fKjRs3Su/evRseHh7y+fPnHB8fH2ZmZuqPP/7QOjo6nL+/v9u4cWMJCAhwb29vCQ0N1fLz85UaGhrq4eFhHThwQIWEhMjevXs9Li5OFBYW1pKSkqT+/vstPDxc/v33X7l161ZFR0c7LS0t3djYKjU1NSk0NFTS0tJUa2urvLy8lNraWhUfH2/hcDiHDx8+0MLCQnl4eHDEx8d7fn6+xMbGysKFC8vff//du3fvygcPHsjs2bMlNzdXpkyZojx+/FjLysoUExMj3r9/X/L06VN5+PBhxcTEyM6dO8tLL720YWBgIHf06FEXFxfr9evXZdSoUaW3t9du2rSpjBgxQn379tXatWurefPmjZqamtT27dt19+7dds+ePXK9evWUoqKiOHr0KEVERCgdHR2yfft2OXXqlCQkJCgnT55Uo0aN0uDgIFlfX69t27al//znP+XOnTvS1tZWMjIyZPDgweXgwYOysLBARo0alWbNmlXm5uZqVlaWvL29Nf3yyy+K49ChQ+K+vr6OiooKISEhKj09Xd69e1fV1tZKV1eX/v333xQWFqaPHz9Wfn5+vHnz5h2wWCzOjo4O+/79u7Nnz54yMzOlR48exZOTE6WmpmbNnDlD8vLyxN+uXbvy7du3snPnTvnu3TuVlZUl7e3tMmbMGCkqKlKnTp2qqKioz549o/T0dAkNDY2/v38bHh6uRUVFCjk5ORITE6Nz5861Bw8e7PDw8Pr1verbwL+A/gfg5Q9Xh5L3bQAAAABJRU5ErkJggg=="
        alt="Shame Logo"
        width={28}
        height={28}
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Shame
      </span>
    </div>
  );
}
