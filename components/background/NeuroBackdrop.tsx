export default function NeuroBackdrop() {
  return (
    <div className="neuro-backdrop" aria-hidden="true">
      <div className="neuro-glow neuro-glow-one" />
      <div className="neuro-glow neuro-glow-two" />
      <div className="neuro-glow neuro-glow-three" />

      <svg className="neuro-web neuro-web-a" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <g className="neuro-line-group neuro-lines-a">
          <path d="M60 180 L210 90 L370 170 L520 80 L700 165 L870 95 L1040 180 L1210 105 L1380 170" />
          <path d="M110 440 L285 335 L455 430 L620 305 L805 400 L975 320 L1160 440 L1335 350" />
          <path d="M40 720 L245 615 L440 700 L660 570 L880 690 L1080 590 L1300 710 L1430 630" />
          <path d="M210 90 L285 335 L370 170 L455 430 L520 80 L620 305 L700 165 L805 400" />
          <path d="M870 95 L975 320 L1040 180 L1160 440 L1210 105 L1335 350" />
          <path d="M245 615 L285 335 L440 700 L455 430 L660 570 L620 305 L880 690 L805 400" />
        </g>

        <g className="neuro-dot-group neuro-dots-a">
          <circle cx="60" cy="180" r="4" />
          <circle cx="210" cy="90" r="5" />
          <circle cx="370" cy="170" r="3.5" />
          <circle cx="520" cy="80" r="4" />
          <circle cx="700" cy="165" r="5" />
          <circle cx="870" cy="95" r="4" />
          <circle cx="1040" cy="180" r="5" />
          <circle cx="1210" cy="105" r="3.5" />
          <circle cx="1380" cy="170" r="4" />

          <circle cx="110" cy="440" r="3.5" />
          <circle cx="285" cy="335" r="5" />
          <circle cx="455" cy="430" r="4" />
          <circle cx="620" cy="305" r="3.5" />
          <circle cx="805" cy="400" r="5" />
          <circle cx="975" cy="320" r="4" />
          <circle cx="1160" cy="440" r="3.5" />
          <circle cx="1335" cy="350" r="5" />

          <circle cx="40" cy="720" r="3.5" />
          <circle cx="245" cy="615" r="5" />
          <circle cx="440" cy="700" r="4" />
          <circle cx="660" cy="570" r="5" />
          <circle cx="880" cy="690" r="4" />
          <circle cx="1080" cy="590" r="5" />
          <circle cx="1300" cy="710" r="4" />
          <circle cx="1430" cy="630" r="3.5" />
        </g>
      </svg>

      <svg className="neuro-web neuro-web-b" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <g className="neuro-line-group neuro-lines-b">
          <path d="M-80 300 L140 220 L330 270 L500 210 L720 310 L940 225 L1160 300 L1500 210" />
          <path d="M-40 610 L190 520 L390 610 L610 500 L850 590 L1080 515 L1290 600 L1500 540" />
          <path d="M140 220 L190 520 L330 270 L390 610 L500 210 L610 500 L720 310 L850 590" />
          <path d="M940 225 L1080 515 L1160 300 L1290 600" />
        </g>

        <g className="neuro-dot-group neuro-dots-b">
          <circle cx="140" cy="220" r="4" />
          <circle cx="330" cy="270" r="3.5" />
          <circle cx="500" cy="210" r="4" />
          <circle cx="720" cy="310" r="5" />
          <circle cx="940" cy="225" r="4" />
          <circle cx="1160" cy="300" r="4" />

          <circle cx="190" cy="520" r="4" />
          <circle cx="390" cy="610" r="5" />
          <circle cx="610" cy="500" r="4" />
          <circle cx="850" cy="590" r="5" />
          <circle cx="1080" cy="515" r="4" />
          <circle cx="1290" cy="600" r="5" />
        </g>
      </svg>

      <svg className="neuro-icons" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <g>
          <text className="neuro-icon neuro-icon-one" x="1120" y="245">✈</text>
          <text className="neuro-icon neuro-icon-two" x="260" y="245">P</text>
          <text className="neuro-icon neuro-icon-three" x="980" y="520">$</text>
          <text className="neuro-icon neuro-icon-four" x="1320" y="500">◎</text>
        </g>
      </svg>
    </div>
  );
}
