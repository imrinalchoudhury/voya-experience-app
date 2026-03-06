import { supabase } from '../lib/supabase';

const sampleJourneys = [
  {
    title: 'London Calling',
    destination: 'London, United Kingdom',
    category: 'Leisure',
    tagline: 'Heritage, haute cuisine & Mayfair elegance',
    depart_date: '2026-09-10',
    return_date: '2026-09-17',
    days: [
      {
        day_number: 1,
        date: '2026-09-10',
        experiences: [
          {
            time: '10:00',
            title: 'Arrival at Claridge\'s',
            category: 'stay',
            concierge_details: 'Art Deco suite confirmed. Butler service arranged. Welcome Champagne on arrival.',
          },
          {
            time: '13:00',
            title: 'Lunch at Scott\'s Mayfair',
            category: 'dining',
            concierge_details: 'Iconic seafood institution. Reserve the private dining room. Dress code: smart.',
          },
          {
            time: '16:00',
            title: 'Private Tour of Buckingham Palace',
            category: 'cultural',
            concierge_details: 'Exclusive after-hours access arranged through concierge. State rooms included.',
          },
          {
            time: '20:00',
            title: 'Dinner at Sketch',
            category: 'dining',
            concierge_details: 'The Gallery room. Artist-designed interiors. Tasting menu with wine flight.',
          },
        ],
      },
      {
        day_number: 2,
        date: '2026-09-11',
        experiences: [
          {
            time: '09:00',
            title: 'Savile Row Bespoke Fitting',
            category: 'shopping',
            concierge_details: 'Appointment at Huntsman. First fitting for a made-to-measure suit.',
          },
          {
            time: '12:00',
            title: 'Afternoon Tea at The Ritz',
            category: 'dining',
            concierge_details: 'Palm Court. Book 3 months in advance. Request window table overlooking the garden.',
          },
          {
            time: '15:00',
            title: 'Private Viewing at Christie\'s',
            category: 'cultural',
            concierge_details: 'Pre-auction viewing of the autumn sale. Personal art advisor included.',
          },
          {
            time: '19:30',
            title: 'Royal Opera House — Box Seats',
            category: 'cultural',
            concierge_details: 'Royal Box arranged. Champagne interval service. Black tie required.',
          },
        ],
      },
    ],
  },
  {
    title: 'Dubai Elevated',
    destination: 'Dubai, UAE',
    category: 'Leisure',
    tagline: 'Gold, sky & desert under the stars',
    depart_date: '2026-11-05',
    return_date: '2026-11-12',
    days: [
      {
        day_number: 1,
        date: '2026-11-05',
        experiences: [
          {
            time: '11:00',
            title: 'Arrival at Burj Al Arab',
            category: 'stay',
            concierge_details: 'Royal Suite confirmed. Private butler and Rolls Royce transfer from airport.',
          },
          {
            time: '14:00',
            title: 'Lunch at Nathan Outlaw at Al Mahara',
            category: 'dining',
            concierge_details: 'Underwater restaurant inside the Burj Al Arab. Seafood tasting menu. Reserve the aquarium table.',
          },
          {
            time: '17:00',
            title: 'Private Helicopter Tour of Dubai',
            category: 'excursion',
            concierge_details: 'Sunset flight over Burj Khalifa, Palm Jumeirah and the coastline. Champagne on board.',
          },
          {
            time: '21:00',
            title: 'Dinner at Nobu Dubai',
            category: 'dining',
            concierge_details: 'Atlantis The Palm. Omakase counter. Ask for the black cod with miso.',
          },
        ],
      },
      {
        day_number: 2,
        date: '2026-11-06',
        experiences: [
          {
            time: '06:00',
            title: 'Private Desert Safari',
            category: 'excursion',
            concierge_details: 'Exclusive camp in the Liwa Desert. Camel trek at sunrise. Traditional breakfast under canvas.',
          },
          {
            time: '10:00',
            title: 'Gold Souk Private Tour',
            category: 'shopping',
            concierge_details: 'Personal shopper and authenticator arranged. Custom jewellery commission possible.',
          },
          {
            time: '14:00',
            title: 'Spa at Talise Ottoman Spa',
            category: 'wellness',
            concierge_details: 'Jumeirah Zabeel Saray. Full day hammam and treatment package. Private suite.',
          },
          {
            time: '20:00',
            title: 'Dinner at Torno Subito',
            category: 'dining',
            concierge_details: 'Waldorf Astoria DIFC. Italian fine dining by Massimo Bottura. Reserve the chef\'s table.',
          },
        ],
      },
    ],
  },
];

export async function loadSampleData() {
  console.log('Loading sample data...');

  for (const journeyData of sampleJourneys) {
    const { title, destination, category, tagline, depart_date, return_date, days } = journeyData;

    const { data: existingJourney } = await supabase
      .from('journeys')
      .select('id')
      .eq('title', title)
      .maybeSingle();

    if (existingJourney) {
      console.log(`Journey "${title}" already exists, skipping...`);
      continue;
    }

    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .insert({
        title,
        destination,
        category,
        tagline,
        depart_date,
        return_date,
      })
      .select()
      .single();

    if (journeyError) {
      console.error(`Error creating journey "${title}":`, journeyError);
      continue;
    }

    console.log(`Created journey: ${title}`);

    for (const dayData of days) {
      const { data: day, error: dayError } = await supabase
        .from('days')
        .insert({
          journey_id: journey.id,
          day_number: dayData.day_number,
          date: dayData.date,
        })
        .select()
        .single();

      if (dayError) {
        console.error(`Error creating day ${dayData.day_number}:`, dayError);
        continue;
      }

      for (const expData of dayData.experiences) {
        const { error: expError } = await supabase.from('experiences').insert({
          day_id: day.id,
          time: expData.time,
          title: expData.title,
          category: expData.category,
          concierge_details: expData.concierge_details,
        });

        if (expError) {
          console.error(`Error creating experience "${expData.title}":`, expError);
        }
      }
    }
  }

  console.log('Sample data loaded successfully!');
}
