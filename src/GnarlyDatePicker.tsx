import {useEffect, useState, useRef, forwardRef} from "react";
import arrowRight from "./assets/arrow-narrow-right.svg"
import arrowLeft from "./assets/arrow-narrow-left.svg"
import "./App.css";

interface AppProps extends React.HTMLProps<HTMLInputElement>{
  name?: string;
  label?: string;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  displayDateText?: boolean;
  wrapperHeight?: string;
  wrapperWidth?: string;
  showColumnIndex?: boolean;
  inputClassName?: string;
}

/**
 * Component GnarlyDatePicker for date selection
 * 
 * @param props - Component props
 * @param {string} props.name - Name of the input
 * @param {string} props.label - Label of the input
 * @param {string} props.date - Date controlled state
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setDate - Date setter
 * @param {boolean} props.displayDateText - display date text
 * @param {string} props.wrapperHeight - Wrapper height
 * @param {string} props.wrapperWidth - Wrapper width
 * @param {boolean} props.showColumnIndex - Show column index
 * @param {string} props.inputClassName - Input class name
 * @param ref - Reference to the input
 * @returns {JSX.Element} - Component JSX
 */
export const GnarlyDatePicker = forwardRef<HTMLInputElement, AppProps>((props, ref) => {
  const {
  name = "date",
  label,
  date, setDate,
  displayDateText = false,
  wrapperHeight = "auto",
  wrapperWidth = "auto",
  showColumnIndex = true,
  inputClassName = "",
    ...rest
} = props;
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const toggleDateSelector = () => {
    setIsDateSelectorOpen(!isDateSelectorOpen);
  };
  const centuries = ["19", "20", "21"];
  const decades = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const years = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const longMonths = ["01", "03", "05", "07", "08", "10", "12"];
  const columnIndex = ["Year", "Month", "Day"]
  const dozeThirtyButton = useRef<HTMLButtonElement>(null);
  const dayNineButton = useRef<HTMLButtonElement>(null);
  const dayZeroButton = useRef<HTMLButtonElement>(null);
  const dayOneButton = useRef<HTMLButtonElement>(null);
  const daysButtons: HTMLButtonElement[] = Array.from(
    document.querySelectorAll('[name="day-unit"]')
  );
  const [currentView, setCurrentView] = useState<'YEAR' | 'MONTH' | 'DAY'>('YEAR');
  useEffect(() => {
    const datePickerWrapper: HTMLDivElement = document.querySelector(
      ".gnarly_date-selector__wrapper"
    ) as HTMLDivElement;
    if (datePickerWrapper.style) {
      (datePickerWrapper.style.gridTemplateAreas = `"year-title month-title day-title" "year month day"`, datePickerWrapper.style.gridTemplateColumns = "50% 20% 30%")
      datePickerWrapper.style.height = wrapperHeight;
      datePickerWrapper.style.width = wrapperWidth;
    }
  }, [wrapperHeight, wrapperWidth]);

  /**
   * Check if a year is bisextile
   * @param year {number}
   */
  const isYearBisextile = (year: number) => {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  };

  /**
   * Handle change date
   * @param e {React.ChangeEvent<HTMLInputElement>}
   */
  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = new RegExp(
      "^(19|20|21)[0-9]{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$"
    );
    if (regex.test(value)) {
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid date format");
    }
    setDate(value)
  }

  /**
   * Format date
   * @param date{string} - Date to format (YYYY-MM-DD)
   * @param isInput{boolean} - If the date is from an input
   */
  const formatDate = (date: string, isInput: boolean = false) => {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    if (isInput){
      return `${month}-${parseInt(day) < 10 ? '0'+day : day}-${year}`
    }
    return `${months[parseInt(month) - 1]} ${day}, ${year}`;
  };

  /**
   * Go to the next step in mobile view of the date selector
   */
  const nextStep = () => {
    if (currentView === 'YEAR') setCurrentView('MONTH');
    else if (currentView === 'MONTH') setCurrentView('DAY');
  }

  /**
   * Go to the previous step in mobile view of the date selector
   */
  const prevStep = () => {
    if (currentView === 'MONTH') setCurrentView('YEAR');
    else if (currentView === 'DAY') setCurrentView('MONTH');
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];

  const doze = ["0", "1", "2", "3"];
  const days = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  /**
   * Set active class on button, remove it from others
   * it's used to highlight the selected button
   * to select the date
   * @param e {React.MouseEvent<HTMLButtonElement>}
   */
  const setActive = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.parentElement
      ?.querySelectorAll("button")
      .forEach((button) => {
        button.classList.remove("active");
      });
    e.currentTarget.classList.add("active");
  };

  /**
   * Handle day zero and dozen zero
   * If the day dozen is 0 and the day unit is 0
   * disable the day zero button
   * @param date {string} - Date to format (YYYY-MM-DD)
   * @param date
   */
  function handleDayZeroAndDozenZero (date: string) {
    if (date.slice(8, 9) === "0") {
      dayZeroButton.current!.disabled = true;
      date.slice(9, 10) === "0"
          ? (date = date.slice(0, 9) + "1")
          : date;
      setDate(date);
    } else {
      dayZeroButton.current!.disabled = false;
    }
  }

  /**
   * Handle dozen three
   * If the day dozen is 3
   * disable days > 0 if the month is short
   * disable days > 1 if the month is long
   * @param date {string} - Date to format (YYYY-MM-DD)
   */
  function handleDozenThree (date: string) {
    if (date.slice(8, 9) === "3") {
      // si le mois est long
      if (longMonths.includes(date.slice(5, 7))) {
        daysButtons.forEach((button) => {
          button.textContent === "0" || button.textContent === "1"
              ? (button.disabled = false)
              : (button.disabled = true);
          parseInt(date.slice(9, 10)) > 1
              ? (date = date.slice(0, 9) + "1")
              : date;
          setDate(date);
        });
      } else {
        daysButtons.forEach((button) => {
          button.textContent === "0"
              ? (button.disabled = false)
              : (button.disabled = true);
          date.slice(9, 10) !== "0"
              ? (date = date.slice(0, 9) + "0")
              : date;
          setDate(date);
        });
      }
    }
  }

  /**
   * Handle february specificities
   * If the month is february
   * disable days > 28 if the year is not bisextile
   * @param date {string} - Date to format (YYYY-MM-DD)
   */
  function handleFebruary (date:string) {
    if (date.slice(5, 7) === "02") {
      dozeThirtyButton.current!.disabled = true;

      // si on est sur 30+ rediriger sur 20
      if (date.slice(8, 9) === "3") {
        date = date.slice(0, 8) + "28";
        setDate(date);
      }

      // si c'est pas bisextile et que la douzaine est 2
      if (
          !isYearBisextile(parseInt(date.slice(0, 4))) &&
          date.slice(8, 9) === "2"
      ) {
        dayNineButton.current!.disabled = true;
        console.log(dayNineButton);
      } else {
        dayNineButton.current!.disabled = false;
      }
    } else {
      dozeThirtyButton.current!.disabled = false;
    }
  }

  /**
   * Handle date selector
   * @param e {React.MouseEvent<HTMLButtonElement>}
   */
  const dateSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    let updatedDate = date;
    setActive(e);
    switch (e.currentTarget.name) {
      case "year-century":
        updatedDate = e.currentTarget.textContent + date.slice(2, 10);
        setDate(updatedDate);
        break;
      case "year-decade":
        updatedDate =
          date.slice(0, 2) + e.currentTarget.textContent + date.slice(3, 10);
        setDate(updatedDate);
        break;
      case "year-unit":
        updatedDate =
          date.slice(0, 3) + e.currentTarget.textContent + date.slice(4, 10);
        setDate(updatedDate);
        break;
      case "month":
        updatedDate =
          date.slice(0, 5) +
          (months.indexOf(e.currentTarget.textContent as string) + 1 <
          10
            ? "0" +
              (months.indexOf(e.currentTarget.textContent as string) +
                1)
            : months.indexOf(e.currentTarget.textContent as string) + 1
          ).toString() +
          date.slice(7, 10);
        setDate(updatedDate);
        break;
      case "day-doze":
        updatedDate =
          date.slice(0, 8) + e.currentTarget.textContent + date.slice(9, 10);
        setDate(updatedDate);
        break;
      case "day-unit":
        updatedDate = date.slice(0, 9) + e.currentTarget.textContent;
        setDate(updatedDate);
        break;
      default:
        break;
    }

    daysButtons.forEach((button) => {
      button.disabled = false;
    });

    // si le mois est février
    handleFebruary(updatedDate)

    // si la douzaine est 3
    handleDozenThree(updatedDate)

    // Si la douzaine jour est 0 et que le day unit est 0
    handleDayZeroAndDozenZero(updatedDate)
  };

  return (
    <div>
        {label ? <label htmlFor="strange-date">{label}:</label> : ""}
        <div className={"gnarly_container gnarly_relative"}>
          <input
            type="text"
            className={`${inputClassName} gnarly_input`}
            id={name}
            name={name}
            value={date}
            onChange={handleChangeDate}
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            ref={ref}
            {...rest}
          />
          {errorMessage && <p>{errorMessage}</p>}
          <div className={`gnarly_container gnarly_float ${isDateSelectorOpen && 'gnarly_rotate'}`} onClick={() => toggleDateSelector()}>
              <img src={arrowRight} width={20} height={20} alt="arrow-right" />
          </div>
        </div>
        <div className={`gnarly_modal ${isDateSelectorOpen ? "gnarly_open" : ""}`}>
          <div className={`gnarly_modal-content ${isDateSelectorOpen ? "gnarly_open" : ""}`}>
            <div className="gnarly_date-selector__wrapper">
              <div className="gnarly_date-selector__mobile-nav">
                <span className="gnarly_date-selector__mobile-nav-left gnarly_button-icon" onClick={prevStep}>
                  <img src={arrowLeft} alt={"arrow-left"}/>
                </span>
                <span className="gnarly_date-selector__mobile-nav-right gnarly_button-icon" onClick={nextStep}>
                  <img src={arrowRight} alt={"arrow-right"}/>
                </span>
              </div>
              {showColumnIndex ? (
                <>
                  <div className={`gnarly_date-selector__wrapper__year__column-index ${currentView !== 'YEAR' ? 'gnarly_hidden' : ''}`}>
                    {columnIndex[0]}
                  </div>
                  <div className={`gnarly_date-selector__wrapper__month__column-index ${currentView !== 'MONTH' ? 'gnarly_hidden' : ''}`}>
                    {columnIndex[1]}
                  </div>
                  <div className={`gnarly_date-selector__wrapper__day__column-index ${currentView !== 'DAY' ? 'gnarly_hidden' : ''}`}>
                    {columnIndex[2]}
                  </div>
                </>
              ) : (
                ""
              )}
              <div className={`gnarly_date-selector__wrapper__year ${currentView !== 'YEAR' ? 'gnarly_hidden' : ''}`}>
                <div className="gnarly_date-selector__wrapper__year__century">
                  {centuries.map((century) => (
                    <button
                      type="button"
                      name="year-century"
                      key={"cent" + century}
                      onClick={(e) => dateSelector(e)}
                      className={`gnarly_button  ${century === date.slice(0, 2) ? "active" : ""}`}
                    >
                      {century}
                    </button>
                  ))}
                </div>
                <div className="gnarly_date-selector__wrapper__year__decade">
                  {decades.map((decade) => (
                    <button
                      type="button"
                      name="year-decade"
                      key={"dec" + decade}
                      onClick={(e) => dateSelector(e)}
                      className={`gnarly_button ${decade.slice(0, 1) === date.slice(2, 3) ? "active" : ""}`}
                    >
                      {decade}
                    </button>
                  ))}
                </div>
                <div className="gnarly_date-selector__wrapper__year__year">
                  {years.map((year) => (
                    <button
                      type="button"
                      name="year-unit"
                      key={"year" + year}
                      onClick={(e) => dateSelector(e)}
                      className={`gnarly_button  ${year === date.slice(3, 4) ? "active" : ""}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`gnarly_date-selector__wrapper__month ${currentView !== 'MONTH' ? 'gnarly_hidden' : ''}`}>
                {months.map((month) => (
                  <button
                    type="button"
                    name="month"
                    key={"month" + month}
                    onClick={(e) => dateSelector(e)}
                    className={`gnarly_button  ${month === months[parseInt(date.slice(5, 7)) - 1]
                        ? "active"
                        : ""}`
                    }
                  >
                    {month}
                  </button>
                ))}
              </div>
              <div className={`gnarly_date-selector__wrapper__day ${currentView !== 'DAY' ? 'gnarly_hidden' : ''}`}>
                <div className="gnarly_date-selector__wrapper__day__doze">
                  {doze.map((doz) => (
                    <button
                      type="button"
                      name="day-doze"
                      key={"doz" + doz}
                      onClick={(e) => dateSelector(e)}
                      className={`gnarly_button  ${doz.slice(0, 1) === date.slice(8, 9) ? "active" : ""}`}
                      ref={doz === "3" ? dozeThirtyButton : null}
                    >
                      {doz}
                    </button>
                  ))}
                </div>
                <div className="gnarly_date-selector__wrapper__day__day">
                  {days.map((day) => (
                    <button
                      type="button"
                      name="day-unit"
                      key={"day" + day}
                      onClick={(e) => dateSelector(e)}
                      className={`gnarly_button  ${day === date.slice(9, 10) ? "active" : ""}`}
                      ref={day === "9"
                          ? dayNineButton
                          : day === "1"
                          ? dayOneButton
                          : day === "0"
                          ? dayZeroButton
                          : null}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {displayDateText ? <h3>{formatDate(date)}</h3> : ""}
    </div>
  );
})
