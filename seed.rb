def tim(h, m)
	Time.utc(2014, 'mar', 12, h, m).to_i % 86400
end

def schedules_from_object(ary)
	ary.each do |sched|
		it = Schedule.create(
				:name      => sched[:name],
				:permanent => sched[:permanent]
		)
		sched[:periods].each do |period|
			it.periods.create(period)
		end
	end
end

example_object = [
		{:name => 'Monday', :permanent => true, :periods =>
				[
						{
								:name          => 3,
								:start_seconds => tim(9, 20),
								:end_seconds   => tim(10, 00),
								:lunch_waves   => 0
						},
						{
								:name          => 4,
								:start_seconds => tim(10, 20),
								:end_seconds   => tim(11, 00),
								:lunch_waves   => 0
						}
				]
		}
]

# Create a Test Schedule
def generate_test_schedule(name, permanent=false, num_periods=8, lunch_period=6, lunch_waves=3, day_start_time=27000, day_end_time=51300, passing_time=300)
	schedule = Schedule.create(
			:name      => name,
			:permanent => permanent
	)

	period_length             = ((day_end_time - day_start_time - ((num_periods-1) * passing_time)) / num_periods)
	current_period_start_time = day_start_time
	num_periods.times do |i|
		schedule.periods.create(
				:name          => (i+1).to_s,
				:start_seconds => current_period_start_time,
				:end_seconds   => current_period_start_time + period_length,
				:lunch_waves   => (i+1 == lunch_period ? lunch_waves : 0)
		)
		current_period_start_time += period_length + passing_time
	end
	schedule # return
end


# Create a Set Schedule
PERIOD_NAME, PERIOD_LENGTH, PERIOD_LUNCH_WAVES = 0, 1, 2

def generate_set_schedule(name, periods_array=[], permanent=false, day_start_time=27000, passing_time=300)
	schedule = Schedule.create(
			:name      => name,
			:permanent => permanent
	)

	current_period_start_time = day_start_time
	periods_array.each do |period_array|
		period_length = (period_array[PERIOD_LENGTH]*60)
		schedule.periods.create(
				:name          => period_array[PERIOD_NAME],
				:start_seconds => current_period_start_time,
				:end_seconds   => current_period_start_time + period_length,
				:lunch_waves   => period_array[PERIOD_LUNCH_WAVES]
		)
		current_period_start_time += period_length + passing_time
	end
	schedule # return
end

# Seed the default schedules
generate_set_schedule('Monday', [['7', 43, 0], ['2', 50, 0], ['3', 49, 0], ['4', 43, 0], ['5', 100, 3], ['1', 46, 0], ['8', 44, 0]], true)
generate_set_schedule('Tuesday', [['6', 50, 0], ['2', 80, 0], ['3', 50, 0], ['1', 100, 3], ['5', 50, 0], ['7', 50, 0]], true)
generate_set_schedule('Wednesday', [['8', 50, 0], ['3', 80, 0], ['2', 50, 0], ['6', 100, 3], ['7', 50, 0], ['4', 50, 0]], true)
generate_set_schedule('Thursday', [['5', 50, 0], ['8', 80, 0], ['4', 50, 0], ['7', 100, 3], ['6', 45, 0], ['1', 55, 0]], true)
generate_set_schedule('Friday', [['3', 46, 0], ['2', 46, 0], ['8', 48, 0], ['1', 44, 0], ['4', 100, 3], ['5', 47, 0], ['6', 44, 0]], true)

# Seed a special schedule
s = generate_test_schedule('Special', false)

Day.create(
		:schedule => s,
		:date     => '20140307'
)

Info.create(
		:text   => 'Science,Computer Science,Music,World Language',
		:type   => '1',
		:period => '1',
		:date   => 'permanent',
)
Info.create(
    :text   => 'Academic Support,Math,Social Studies,Special Ed',
    :type   => '2',
    :period => '1',
    :date   => 'permanent',
)
Info.create(
    :text   => 'Art,English,Family Science,Media,PE,Technology,Theater',
    :type   => '3',
    :period => '1',
    :date   => 'permanent',
)
Info.create(
    :text   => 'English',
    :type   => 'lunch-2',
    :period => '6',
    :date   => '20140326',
)
Info.create(
    :text   => 'World Language',
    :type   => 'lunch-2',
    :period => '6',
    :date   => '20140326',
)
Info.create(
    :text   => 'This is a test.',
    :type   => '',
    :period => '6',
    :date   => '20140326',
)
Info.create(
    :text   => 'test',
    :type   => 'lunch-3',
    :period => '2',
    :date   => '20140326',
)

thu = Schedule.create(
		:name => 'CAPT Thursday march 13',
		:permanent => false
)

thu.periods.create(
		:name => 3,
		:start_seconds => tim(9,20),
		:end_seconds => tim(10,00),
		:lunch_waves => 0
)
thu.periods.create(
		:name => 2,
		:start_seconds => tim(10,05),
		:end_seconds => tim(10,50),
		:lunch_waves => 0
)
thu.periods.create(
		:name => 6,
		:start_seconds => tim(10,55),
		:end_seconds => tim(12,35),
		:lunch_waves => 3
)
thu.periods.create(
		:name => 7,
		:start_seconds => tim(12,40),
		:end_seconds => tim(13,25),
		:lunch_waves => 0
)
thu.periods.create(
		:name => 8,
		:start_seconds => tim(13,30),
		:end_seconds => tim(14,15),
		:lunch_waves => 0
)

Day.create(
		:schedule => thu,
		:date     => '20140313'
)
