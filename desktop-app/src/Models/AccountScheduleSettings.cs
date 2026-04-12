using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("AccountScheduleSettings")]
    public class AccountScheduleSettings
    {
        [Key]
        public int TradingAccountId { get; set; }

        [Required]
        public bool IsEnabled { get; set; } = false;

        [Required]
        public TimeSpan StartTime { get; set; } = new TimeSpan(9, 30, 0); // 9:30 AM

        [Required]
        public TimeSpan EndTime { get; set; } = new TimeSpan(16, 0, 0); // 4:00 PM

        [Required]
        public bool Monday { get; set; } = true;

        [Required]
        public bool Tuesday { get; set; } = true;

        [Required]
        public bool Wednesday { get; set; } = true;

        [Required]
        public bool Thursday { get; set; } = true;

        [Required]
        public bool Friday { get; set; } = true;

        [Required]
        public bool Saturday { get; set; } = false;

        [Required]
        public bool Sunday { get; set; } = false;

        [Required]
        public bool RespectMarketHolidays { get; set; } = true;

        [Required]
        public bool AutoStartTrading { get; set; } = false;

        [Required]
        public bool AutoStopTrading { get; set; } = false;

        [StringLength(50)]
        public string TimeZone { get; set; } = "Eastern Standard Time";

        [StringLength(500)]
        public string? CustomSchedule { get; set; } // JSON object for custom schedules

        public DateTime? LastUpdatedAt { get; set; }

        // Navigation properties
        public virtual TradingAccount TradingAccount { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsWeekdayOnly => Monday && Tuesday && Wednesday && Thursday && Friday && !Saturday && !Sunday;

        [NotMapped]
        public bool IsWeekendIncluded => Saturday || Sunday;

        [NotMapped]
        public string DisplaySchedule => $"{StartTime:hh\\:mm} - {EndTime:hh\\:mm} ({DaysString})";

        [NotMapped]
        public string DaysString
        {
            get
            {
                var days = new List<string>();
                if (Monday) days.Add("Mon");
                if (Tuesday) days.Add("Tue");
                if (Wednesday) days.Add("Wed");
                if (Thursday) days.Add("Thu");
                if (Friday) days.Add("Fri");
                if (Saturday) days.Add("Sat");
                if (Sunday) days.Add("Sun");
                return string.Join(", ", days);
            }
        }

        [NotMapped]
        public bool IsCurrentlyActive
        {
            get
            {
                if (!IsEnabled) return false;

                var now = DateTime.Now;
                var currentTime = now.TimeOfDay;
                var currentDay = now.DayOfWeek;

                // Check if current day is enabled
                bool isDayEnabled = currentDay switch
                {
                    DayOfWeek.Monday => Monday,
                    DayOfWeek.Tuesday => Tuesday,
                    DayOfWeek.Wednesday => Wednesday,
                    DayOfWeek.Thursday => Thursday,
                    DayOfWeek.Friday => Friday,
                    DayOfWeek.Saturday => Saturday,
                    DayOfWeek.Sunday => Sunday,
                    _ => false
                };

                if (!isDayEnabled) return false;

                // Check if current time is within trading hours
                return currentTime >= StartTime && currentTime <= EndTime;
            }
        }
    }
}
